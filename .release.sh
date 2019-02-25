cd frontend
npm run-script build
cd ..
gunicorn app:app
