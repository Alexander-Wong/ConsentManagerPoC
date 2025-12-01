#!/bin/bash

# 1) Save the version type (patch, minor, major)
VERSION_TYPE=$1

# 2) Stash everything
git stash -q --keep-index

# 3) Run tests + build (prepare)
npm test && npm run build

# 4) Bump the version BUT DO NOT COMMIT
npm version $VERSION_TYPE --no-git-tag-version

# 5) Reapply developer changes
git stash pop -q

# 6) Stage everything including version bump
git add .

# 7) Create a single commit with dev-provided msg
echo "Enter release commit message:"
read COMMIT_MSG
git commit -m "$COMMIT_MSG"

# 8) Create the tag
VERSION=$(node -p \"require('./package.json').version\")
git tag v$VERSION

# 9) Push commit + tag
git push
git push --tags

echo "✔ Release $VERSION completed in a single commit!"
