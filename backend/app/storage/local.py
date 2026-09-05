import os
import uuid
from typing import BinaryIO
from app.storage.base import StorageAdapter
from app.config import settings

class LocalStorage(StorageAdapter):
    def __init__(self, base_path: str = None):
        self.base_path = base_path or settings.LOCAL_STORAGE_PATH
        os.makedirs(self.base_path, exist_ok=True)

    def save(self, file_obj: BinaryIO, filename: str) -> str:
        ext = os.path.splitext(filename)[1].lower()
        storage_key = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(self.base_path, storage_key)
        
        with open(filepath, "wb") as f:
            f.write(file_obj.read())
            
        return storage_key

    def get_url(self, storage_key: str) -> str:
        if not storage_key:
            return ""
        if storage_key.startswith("http://") or storage_key.startswith("https://"):
            return storage_key
        return f"/media/{storage_key}"

    def delete(self, storage_key: str) -> bool:
        filepath = os.path.join(self.base_path, storage_key)
        if os.path.exists(filepath):
            os.remove(filepath)
            return True
        return False
