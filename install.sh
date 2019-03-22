#! /bin/bash
set -e
echo "I hope you installed postgres first!"
if [[ "$OSTYPE" == "linux-gnu" ]] ; then
    sudo -u postgres createdb dogu
    sudo -u postgres createuser -d dogu
    sudo -u postgres psql -c "ALTER USER dogu LOGIN PASSWORD 'password';"
elif [[ "$OSTYPE" == "darwin" ]]; then
    echo "O geez you're on a Mac. I hope these commands work. And you've figured out how to start postgres"
    createdb dogu
    createuser -d dogu
    psql postgres psql -c "ALTER USER dogu LOGIN PASSWORD 'password';"
else
    echo "O Christ, are you on Windows? I hope you're on good terms with your god."
    echo ">> Exits, does nothing"
    exit 1
fi

./migrate.py migrate
