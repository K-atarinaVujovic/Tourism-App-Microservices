import os
import uuid

from fastapi import UploadFile

class Uploader:
  async def upload_image(self, file: UploadFile):
    os.makedirs("images", exist_ok=True)
    filename = f"{uuid.uuid4()}{os.path.splitext(file.filename or '')[1]}"
    file_path = f"images/{filename}"
    
    with open(file_path, "wb") as f:
        contents = await file.read()
        f.write(contents)
    
    return {"imageUrl": f"/images/{filename}"}