#!/bin/bash
# Fix duplicate React packages in monorepo

WEB_MODULES="apps/web/node_modules"

if [ -d "$WEB_MODULES/react" ] && [ ! -L "$WEB_MODULES/react" ]; then
  echo "Fixing React duplicates..."
  rm -rf "$WEB_MODULES/react" "$WEB_MODULES/react-dom"
  ln -s ../../../node_modules/react "$WEB_MODULES/react"
  ln -s ../../../node_modules/react-dom "$WEB_MODULES/react-dom"
  echo "Done!"
else
  echo "React already fixed or symlinked."
fi
