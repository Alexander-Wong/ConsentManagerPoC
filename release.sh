#!/bin/bash

# Exit on error
set -e

VERSION_TYPE=$1

if [ -z "$VERSION_TYPE" ]; then
  echo "❌ You must pass a version type: patch | minor | major"
  exit 1
fi

echo "📦 Starting $VERSION_TYPE release..."

# Ensure at least some changes are staged
if git diff --cached --quiet; then
  echo "❌ No staged changes found. Stage what you want to release first."
  exit 1
fi

# Stash everything except staged files
echo "📥 Stashing unstaged changes..."
git stash -q --keep-index

STASHED=true

# Ask developer for the commit message
echo "📝 Enter your release commit message:"
read COMMIT_MSG

# Run tests and build
echo "🧪 Running tests..."
npm test

echo "🏗️ Building project..."
npm run build

# Bump version without auto-commit or tag
echo "🔢 Bumping version..."
npm version $VERSION_TYPE --no-git-tag-version

# Generate/update the changelog
echo "📝 Updating CHANGELOG.md..."
npm run changelog:update

# Stage everything for the release commit
git add .

# Create single commit
echo "🔒 Creating release commit..."
git commit -m "$COMMIT_MSG"

# Get new version number
VERSION=$(node -p "require('./package.json').version")

# Tag the release
echo "🏷️ Tagging version v$VERSION..."
git tag "v$VERSION"

# Push commit and tag
echo "📤 Pushing to origin..."
git push
git push --tags

# Restore unstaged changes
if [ "$STASHED" = true ]; then
  echo "📤 Restoring unstaged changes..."
  git stash pop -q || true
fi

echo "🎉 Release v$VERSION completed successfully!"
echo "✔ All unstaged changes restored."
