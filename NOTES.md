## CHECKPOINT

### Models download first time:

- `whisper-tiny`: ~5.7s
- `whisper-base`: ~9.5S
- `whisper-small`: ~15.7s

### Models loading after first download:

- `whisper-tiny`: ~0.5s
- `whisper-base`: ~0.5S
- `whisper-small`: ~1s

when models are downloaded, they are kept in browser's storage which is good

## TODOS

- [ ] add an explicit toggle to allow mic usage when first time
- [ ] use `src/` folder
- [ ] fix record button not centered on mobile
- [ ] show tests history
- [x] create `/merge-main` command that merges current branch to main and asks to increment either patch, minor or major version and update it in package.json, and then add a tag with the same version on main
- [ ] implement a mecanism to clear the cache storage
- [ ] convert this app into PWA

## LEARN

- [ ] Browser's cache storage (DevTools -> Application -> Cache Storage)
- [ ] Browser's IndexedDB (DevTools -> Application -> IndexedDB)
