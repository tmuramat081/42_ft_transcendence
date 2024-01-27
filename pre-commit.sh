#!/bin/sh

directories=("frontend" "backend")

# 各ディレクトリで npm run lint を実行
for dir in "${directories[@]}"; do
    echo "Linting in $dir..."
    cd "$dir" && npm run lint-staged
    if [ $? -ne 0 ]; then
        echo "Linting failed in $dir"
        exit 1
    fi
    cd - > /dev/null
done