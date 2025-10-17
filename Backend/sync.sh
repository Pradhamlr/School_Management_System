#!/bin/bash

set -e 

echo "Checking current Git branch..."
CURRENT_BRANCH=$(git branch --show-current)

if [ "$CURRENT_BRANCH" == "develop" ] || [ "$CURRENT_BRANCH" == "main" ]; then
  echo "Please run this script from your feature branch (not develop/main)."
  exit 1
fi

echo "Committing current changes..."
git add .
git commit -m "WIP: auto-save before sync" || echo "No changes to commit."

echo "Fetching latest branches..."
git fetch origin

echo "Switching to develop branch..."
git checkout develop

echo "Pulling latest changes from develop..."
git pull origin develop

echo "Switching back to your feature branch: $CURRENT_BRANCH"
git checkout "$CURRENT_BRANCH"

echo "Merging develop into $CURRENT_BRANCH ..."
git merge develop || {
  echo "Merge conflicts detected! Please resolve them manually, then re-run this script."
  exit 1
}

echo "Updating Prisma..."
npx prisma generate
npx prisma migrate deploy

echo "All synced! Youre now up-to-date with develop "
echo "You can now continue working on your feature branch safely."
