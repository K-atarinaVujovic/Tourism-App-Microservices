import os
import uuid

from fastapi import UploadFile

class Uploader:
  async def upload_image(self, file: UploadFile):
    os.makedirs("images", exist_ok=True)
    ext = os.path.splitext(file.filename or '')[1]
    filename = f"{uuid.uuid4()}{ext}"
    file_path = f"images/{filename}"
    
    with open(file_path, "wb") as f:
        contents = await file.read()
        f.write(contents)
    
    return {"imageUrl": f"/images/{filename}"}
  
  def upload_image_bytes(self, file_data: bytes, filename: str):
    os.makedirs("images", exist_ok=True)
    ext = os.path.splitext(filename or '')[1]
    generated_filename = f"{uuid.uuid4()}{ext}"
    file_path = f"images/{generated_filename}"
    
    with open(file_path, "wb") as f:
        f.write(file_data)
    
    return {"imageUrl": f"/images/{generated_filename}"}