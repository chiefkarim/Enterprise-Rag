import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
import io
from googleapiclient.http import MediaIoBaseDownload
from utils import abs_path


from utils import abs_path


class GoogleDriveService:
    def __init__(self) -> None:
        SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]
        SERVICE_ACCOUNT_FILE = os.path.join(abs_path(__file__, "service-account.json"))
        creds = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES
        )

        self.service = build("drive", "v3", credentials=creds)

    def download_file(self, output_dir: str, file_id: str) -> str:
        service = self.service

        file_metadata = service.files().get(fileId=file_id, fields="name").execute()
        file_name = file_metadata["name"]

        output_path = os.path.join(output_dir, file_name)

        request = service.files().get_media(fileId=file_id)

        fh = io.FileIO(output_path, "wb")
        downloader = MediaIoBaseDownload(fh, request)

        done = False
        while not done:
            status, done = downloader.next_chunk()
            print(f"Download {int(status.progress() * 100)}%.")

        print(f"Download complete: {file_name}")
        return output_path
