import asyncio
import json
import logging
import os

import aio_pika
from aio_pika import Message

from app.schemas.profile import BalanceResponse
from app.services.profile import ProfileService

QUEUE_STAKEHOLDER_COMMANDS = "saga.stakeholder.commands"
INTERNAL_SECRET = os.getenv("INTERNAL_SECRET")

logger = logging.getLogger(__name__)


class StakeholderConsumer:
    def __init__(self, profile_service: ProfileService):
        self.profile_service = profile_service
        self.connection = None
        self.channel = None

    async def connect(self, amqp_url: str):
        self.connection = await aio_pika.connect_robust(amqp_url)
        self.channel = await self.connection.channel()
        await self.channel.set_qos(prefetch_count=10)
        queue = await self.channel.declare_queue(QUEUE_STAKEHOLDER_COMMANDS, durable=True)
        await queue.consume(self.handle)
        logger.info(f"[MQ] Stakeholder consumer started on {QUEUE_STAKEHOLDER_COMMANDS}")

    async def handle(self, message: aio_pika.IncomingMessage):
        async with message.process():
            try:
                cmd = json.loads(message.body)
                command = cmd.get("command")
                payload = cmd.get("payload", {})
                is_internal = cmd.get("is_internal", False)

                match command:
                    case "DEDUCT_BALANCE":
                        reply = await self._handle_deduct_balance(payload)
                    case "REFUND_BALANCE":
                        reply = await self._handle_refund_balance(payload, is_internal)
                    case _:
                        reply = {"success": False, "error": f"unknown command: {command}"}

                await self.channel.default_exchange.publish(
                    Message(
                        body=json.dumps(reply).encode(),
                        content_type="application/json",
                        correlation_id=message.correlation_id,
                    ),
                    routing_key=message.reply_to,
                )
            except Exception as e:
                logger.error(f"[MQ] Unhandled error in consumer: {e}")

    async def _handle_deduct_balance(self, payload: dict) -> dict:
        try:
            user_id = int(payload["tourist_id"])
            amount = float(payload["amount"])
            result = await self.profile_service.deduct_balance(user_id, amount)
            return {"success": True, "payload": {"new_balance": result.balance}}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _handle_refund_balance(self, payload: dict, is_internal: bool) -> dict:
        if not is_internal:
            return {"success": False, "error": "unauthorized: internal only"}
        try:
            user_id = int(payload["tourist_id"])
            amount = float(payload["amount"])
            result = await self.profile_service.refund_balance(user_id, amount)
            return {"success": True, "payload": {"new_balance": result.balance}}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def close(self):
        if self.connection:
            await self.connection.close()