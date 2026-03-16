import os
import threading
from google.oauth2 import service_account
from googleapiclient.discovery import build
import io
from googleapiclient.http import MediaIoBaseDownload
from utils import abs_path

class GoogleDriveService:
    def __init__(self) -> None:
        self.SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]
        self.SERVICE_ACCOUNT_FILE = os.path.join(abs_path(__file__, "service-account.json"))
        self._local = threading.local()

    def _get_service(self):
        """Get or create a thread-local drive service."""
        if not hasattr(self._local, "service"):
            creds = service_account.Credentials.from_service_account_file(
                self.SERVICE_ACCOUNT_FILE, scopes=self.SCOPES
            )
            self._local.service = build("drive", "v3", credentials=creds, cache_discovery=False)
        return self._local.service

    def get_file_name(self, file_id: str) -> str:
        """Fetch the file name for a given file_id without downloading the file."""
        file_id = file_id.strip()
        service = self._get_service()
        try:
            file_metadata = service.files().get(fileId=file_id, fields="name").execute()
            return file_metadata["name"]
        except Exception as e:
            from infrastructure.logging_config import logger
            logger.error(f"Google Drive API error for file_id {file_id}: {e}")
            raise

    def download_file(self, output_dir: str, file_id: str) -> tuple[str, str]:
        file_id = file_id.strip()
        service = self._get_service()

        file_name = self.get_file_name(file_id)
        output_path = os.path.join(output_dir, file_name)

        request = service.files().get_media(fileId=file_id)

        fh = io.FileIO(output_path, "wb")
        downloader = MediaIoBaseDownload(fh, request)

        done = False
        while not done:
            status, done = downloader.next_chunk()
            # print(f"Download {int(status.progress() * 100)}%.")

        return output_path, file_name
