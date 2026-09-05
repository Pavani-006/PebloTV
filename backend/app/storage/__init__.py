from app.config import settings
from app.storage.local import LocalStorage
from app.storage.r2 import R2Storage

def get_storage():
    if settings.STORAGE_TYPE == "r2":
        return R2Storage()
    return LocalStorage()
