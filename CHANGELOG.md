# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

## [1.6.0] - 2026-03-08

### Chores

- Move API to new Repository

## [1.5.0] - 2025-12-24

### Added

- Added `imgpot` as a client.

### Chores

- Maintenance.

## [1.4.0] - 2024-10-16

### Chores

- Images now support arm64.

## [1.3.0] - 2024-09-06

### Added

- Added `bbdb` as a client.

### Fixed

- Fixed a bug that would cause `expires_in` to be undefined in the token response.

## [1.2.1] - 2024-07-15

### Fixed

- Fixed an async statement that would sometimes break during tests.
- Fixed an issue where an invalid session would not be terminated.

### Chores

- Updated dependencies.

## [1.2.0] - 2024-04-28

### Added

- Login requests that are turned down by potber-api due to the user being locked permanently are now being displayed properly.

## [1.1.1] - 2024-04-05

### Added

- Added reference to [https://mods-mpe.de](https://mods-mpe.de) to the about page.

## [1.1.0] - 2024-03-11

### Added

- Implemented client-side tests with `playwright`.
- Dependabot can now merge non-major version changes automatically.
- Added `mpe` as a known client.

### Chores

- chore(deps-dev): bump vite from 5.0.10 to 5.1.6
- chore(deps-dev): bump @sveltejs/adapter-auto from 3.0.0 to 3.1.1
- chore(deps-dev): bump svelte-fa from 3.0.4 to 4.0.2
- chore(deps-dev): bump @sveltejs/kit from 2.0.1 to 2.5.3
- chore(deps-dev): bump @sveltejs/adapter-node from 2.0.0 to 5.0.1

## [1.0.1] - 2023-12-21

### Fixed

- Fixed environment variables not being adressed properly.

### Added

- Provided a `staging` build at https://test-auth.potber.de.

## [1.0.0] - 2023-12-19

Initial release.
