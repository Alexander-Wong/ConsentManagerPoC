#!/bin/bash

# Exit on error
set -e

VERSION_TYPE=$1

if [ -z "$VERSION_TYPE" ]; then
  echo "❌ You must pass a version type: patch | minor | major"
  exit 1
fi

echo "📦 Starting $VERSION_TYPE release..."

# Ensure clean working directory
if ! git diff-index --quiet HEAD --; then
  echo "❌ Working directory not clean. Commit or stash your changes first."
  exit 1
fi

# Ask developer for the commit message
echo "📝 Enter the release commit message (your custom message):"
read COMMIT_MSG

# Run tests and build
echo "🧪 Running tests..."
npm test

echo "🏗️ Building project..."
npm run build

# Bump version (but do NOT commit/tag yet)
echo "🔢 Bumping version..."
npm version $VERSION_TYPE --no-git-tag-version

# Update CHANGELOG
echo "📝 Updating CHANGELOG.md..."
npm run changelog:update

# Stage all changes
git add .

# Create a single commit with developer message
echo "🔒 Creating single release commit..."
git commit -m "$COMMIT_MSG"

# Extract new version
VERSION=$(node -p "require('./package.json').version")

# Create git tag
echo "🏷️ Tagging version v$VERSION..."
git tag "v$VERSION"

# Push commit + tag
echo "📤 Pushing to origin..."
git push
git push --tags

echo "🎉 Release v$VERSION completed successfully!"
