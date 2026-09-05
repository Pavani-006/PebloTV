from abc import ABC, abstractmethod
from typing import BinaryIO

class StorageAdapter(ABC):
    @abstractmethod
    def save(self, file_obj: BinaryIO, filename: str) -> str:
        """Saves file to storage and returns unique storage_key."""
        pass

    @abstractmethod
    def get_url(self, storage_key: str) -> str:
        """Returns accessible URL for a given storage_key."""
        pass

    @abstractmethod
    def delete(self, storage_key: str) -> bool:
        """Deletes file from storage."""
        pass
