import json
import base64
import io
from PIL import Image, ImageFilter
import cv2
import numpy as np
import requests
from appwrite.client import Client
from appwrite.services.storage import Storage

import json
import base64
import io
from PIL import Image, ImageFilter
import cv2
import numpy as np
import requests
from appwrite.client import Client
from appwrite.services.storage import Storage
from appwrite.services.databases import Databases
from datetime import datetime

def main(context):
    """
    Face blur function for LoppeRater photos
    Processes photos in the photos bucket, replacing originals with blurred versions when faces are detected
    """

    try:
        # Get environment variables
        appwrite_endpoint = context.env.get('APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1')
        appwrite_project = context.env.get('APPWRITE_PROJECT_ID')
        appwrite_api_key = context.env.get('APPWRITE_API_KEY')
        database_id = context.env.get('DATABASE_ID', 'lopperater')

        # Initialize Appwrite client
        client = Client()
        client.set_endpoint(appwrite_endpoint)
        client.set_project(appwrite_project)
        client.set_key(appwrite_api_key)

        storage = Storage(client)
        databases = Databases(client)

        # Get function payload
        payload = context.req.json() if context.req.body else {}

        raw_file_id = payload.get('rawFileId')
        stall_id = payload.get('stallId')
        user_id = payload.get('userId')
        photo_record_id = payload.get('photoRecordId')

        if not raw_file_id:
            return context.res.json({
                'success': False,
                'error': 'rawFileId is required'
            })

        if not photo_record_id:
            return context.res.json({
                'success': False,
                'error': 'photoRecordId is required'
            })

        # Update processing status to 'processing'
        try:
            databases.update_document(
                database_id=database_id,
                collection_id='photos',
                document_id=photo_record_id,
                data={
                    'processingStatus': 'processing',
                    'processingStartedAt': datetime.utcnow().isoformat()
                }
            )
        except Exception as e:
            context.log(f"Failed to update processing status: {str(e)}")

        # Download the raw image from photos bucket
        try:
            file_response = storage.get_file_download('photos', raw_file_id)
            image_data = file_response.content
        except Exception as e:
            # Update status to failed
            try:
                databases.update_document(
                    database_id=database_id,
                    collection_id='photos',
                    document_id=photo_record_id,
                    data={
                        'processingStatus': 'failed',
                        'processingCompletedAt': datetime.utcnow().isoformat()
                    }
                )
            except:
                pass

            return context.res.json({
                'success': False,
                'error': f'Failed to download raw file: {str(e)}'
            })

        # Convert to numpy array for OpenCV processing
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            # Update status to failed
            try:
                databases.update_document(
                    database_id=database_id,
                    collection_id='photos',
                    document_id=photo_record_id,
                    data={
                        'processingStatus': 'failed',
                        'processingCompletedAt': datetime.utcnow().isoformat()
                    }
                )
            except:
                pass

            return context.res.json({
                'success': False,
                'error': 'Invalid image format'
            })

        # Load Haar cascade for face detection
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

        # Convert to grayscale for face detection
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Detect faces
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        faces_detected = len(faces)

        if faces_detected == 0:
            # No faces detected, keep original image
            processed_file_id = raw_file_id
            processed_image_data = image_data
        else:
            # Blur detected faces
            for (x, y, w, h) in faces:
                # Extract face region
                face_roi = image[y:y+h, x:x+w]

                # Apply Gaussian blur
                blurred_face = cv2.GaussianBlur(face_roi, (51, 51), 30)

                # Replace original face with blurred version
                image[y:y+h, x:x+w] = blurred_face

            # Convert back to bytes
            success, encoded_image = cv2.imencode('.jpg', image)
            if not success:
                # Update status to failed
                try:
                    databases.update_document(
                        database_id=database_id,
                        collection_id='photos',
                        document_id=photo_record_id,
                        data={
                            'processingStatus': 'failed',
                            'processingCompletedAt': datetime.utcnow().isoformat()
                        }
                    )
                except:
                    pass

                return context.res.json({
                    'success': False,
                    'error': 'Failed to encode processed image'
                })

            processed_image_data = encoded_image.tobytes()

            # Replace original file with processed version
            try:
                # Delete original file
                storage.delete_file('photos', raw_file_id)

                # Upload processed image with same ID
                processed_file = storage.create_file(
                    bucket_id='photos',
                    file_id=raw_file_id,  # Use same ID to replace
                    file=io.BytesIO(processed_image_data),
                    permissions=['read("any")']
                )
                processed_file_id = processed_file['$id']
            except Exception as e:
                # Update status to failed
                try:
                    databases.update_document(
                        database_id=database_id,
                        collection_id='photos',
                        document_id=photo_record_id,
                        data={
                            'processingStatus': 'failed',
                            'processingCompletedAt': datetime.utcnow().isoformat()
                        }
                    )
                except:
                    pass

                return context.res.json({
                    'success': False,
                    'error': f'Failed to replace image: {str(e)}'
                })

        # Update database record with processing results
        try:
            update_data = {
                'processingStatus': 'completed',
                'processingCompletedAt': datetime.utcnow().isoformat(),
                'facesDetected': faces_detected,
                'processedFileId': processed_file_id,
                'bucketId': 'photos'
            }

            if faces_detected > 0:
                update_data['size'] = len(processed_image_data)

            databases.update_document(
                database_id=database_id,
                collection_id='photos',
                document_id=photo_record_id,
                data=update_data
            )
        except Exception as e:
            context.log(f"Failed to update database record: {str(e)}")

        # Generate processed photo URL
        processed_photo_url = f"{appwrite_endpoint}/storage/buckets/photos/files/{processed_file_id}/view"

        return context.res.json({
            'success': True,
            'facesDetected': faces_detected,
            'rawFileId': raw_file_id,
            'processedFileId': processed_file_id,
            'photoRecordId': photo_record_id,
            'processedPhotoUrl': processed_photo_url,
            'message': f'Successfully processed photo with {faces_detected} face(s) blurred'
        })

    except Exception as e:
        return context.res.json({
            'success': False,
            'error': f'Unexpected error: {str(e)}'
        })

# For local testing
if __name__ == "__main__":
    # Mock context for testing
    class MockContext:
        def __init__(self):
            self.env = {
                'APPWRITE_ENDPOINT': 'https://cloud.appwrite.io/v1',
                'APPWRITE_PROJECT_ID': '68d54fa1002fef97f2b6',
                'APPWRITE_API_KEY': 'standard_deffa13324835e48c715e294c5aef557233d75d1fd20eb0749612971998a8592c7654837c3aa141a23b6562406ed2b1f79a6a7c2718cada3a24120913d7a1278cd9aab5750855dbc01f4ce042ca0f8c2d1d3f6729a63d24503f57582b8906c85bfc856b96e8c13d5dcf4e766909192774fb2474d6ac3024b5dbec24b2731d213'
            }
            self.req = type('obj', (object,), {'json': lambda: {'bucketId': 'photos', 'fileId': 'test'}})()
            self.res = type('obj', (object,), {'json': lambda data: data})()

    context = MockContext()
    result = main(context)
    print(json.dumps(result, indent=2))