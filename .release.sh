cd dogu
npm run-script build
cd ..
gunicorn app:app
