set -e
if [ ! -f secrets ] then
    gpg secrets.sh.gpg
fi

source secrets.sh
echo "I hope you installed postgres first!"
sudo -u postgres createdb dogu
sudo -u postgres createuser dogu
sudo -u postgres psql -c "ALTER USER dogu LOGIN PASSWORD '$UNIVERSAL_PASSWORD';"
