# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Fulltext query on any string fields in Plots and Soil profiles.
- Pie chart in plot samples.
- Delete many functionality for all tables.
- Get elevation on `plot` table if elevation (`coord_z`) is set to 0.
- Bulk update on `plot` table.

### Changed

- Set create many on `plot` table with list of records instead of CSV using
the `react-admin-import-csv`.

### Removed

- The list of Plot Samples as this data is found within the plots.


## [1.1.2] - 2024-06-10

### Added

- This changelog file.
- Real associated image added for plots into DB as byte64.
- Real images (photo and illustration) for soil profile in DB as byte64.

### Removed

- Relationship lookups in list pages to increase performance.

## [1.1.1] - 2024-05-15

### Added

- Icons, legend and date fields in the plot map.

## [1.1.0] - 2024-05-14

### Changes

- Areas are defined by a convex hull with a buffer instead of a drawn
polygon.

[unreleased]: https://github.com/LabSOIL/sensormap-ui/compare/v1.1.1...HEAD
[1.1.2]: https://github.com/LabSOIL/sensormap-ui/compare/0.1.1...0.1.2
[1.1.1]: https://github.com/LabSOIL/sensormap-ui/compare/0.1.0...0.1.1
[1.1.0]: https://github.com/LabSOIL/sensormap-ui/compare/0.0.1...0.1.0
