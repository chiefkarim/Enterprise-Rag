from features.google_drive.google_drive_service import GoogleDriveService
from utils import abs_path

OUTPUT_PATH = abs_path(__file__, "tmp/tmp_file.pdf")
FILE_ID = "13ozGkAhjrz-IKRjdeCe172g0lPuvTRBe"


service = GoogleDriveService()
request = service.service.files().get_media(fileId=FILE_ID)


# service.download_file(OUTPUT_PATH, FILE_ID)


## open file for reading with OUTPUT_PATH

## do something withj docling to extract metadata

results = service.service.files().list(pageSize=10, fields="files(id,name)").execute()


for file in results.get("files", []):
    print(
        "file:",
    )
    print(file["name"], file["id"])
