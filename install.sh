set -e
echo "I hope you installed postgres first!"
sudo -u postgres createdb dogu
sudo -u postgres createuser dogu
sudo -u postgres psql -c "ALTER USER dogu LOGIN PASSWORD 'password';"
