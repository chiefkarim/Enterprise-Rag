import sys
import os

# Add the apps/backend directory to sys.path so we can import features/infrastructure
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from redis import Redis
from rq import SimpleWorker, Queue
from features.ingestion.tasks import redis_conn

listen = ["embeddings"]

if __name__ == "__main__":
    # Pass connection directly to Queue and Worker to avoid import issues with Connection context manager
    queues = [Queue(name, connection=redis_conn) for name in listen]
    worker = SimpleWorker(queues, connection=redis_conn)
    print("Starting RQ worker on 'embeddings' queue...")
    worker.work()
