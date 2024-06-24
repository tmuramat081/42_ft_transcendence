#!/bin/sh

directories=("frontend" "backend")

for dir in "${directories[@]}"; do
    echo "Linting in $dir..."
    cd "$dir" && npm run lint
    if [ $? -ne 0 ]; then
        echo "Linting failed in $dir"
        exit 1
    fi
    cd - > /dev/null
done