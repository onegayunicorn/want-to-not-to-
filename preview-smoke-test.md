# Preview smoke test

The updated local preview was inspected from a clean browser-local state. The Write route rendered the prompt chips, anonymous copy, and guide controls. An exact 360-character input displayed `360/360` and remained accepted; a programmatic 361-character input displayed `361/360` and disabled the guide.

The Commons route rendered intact Crowd, Small crowd, Single card, Cards, and Map / ideas controls. Small crowd became active when selected. Single card rendered the focused card, bounded Previous/Next controls, and reading-time metadata. Map / ideas rendered the conceptual-similarity explanation, zoom-out, zoom-in, Reset, and anonymous idea nodes. Selecting a node transitioned into Single card; returning to Map / ideas and clicking zoom in visibly changed the node field scale while retaining the same route and controls.

The smoke test also caught and corrected malformed HTML-template quotes on the Single card and Map / ideas buttons. A cache-busted reload confirmed both controls rendered with normal horizontal dimensions and intact labels.
