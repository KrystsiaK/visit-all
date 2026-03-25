# Layer Visibility Test Matrix

## Goal

These are the scenarios that must pass before we consider the layer visibility system stable.

## Baseline

### 1. Clean start

Given:

1. three layers
2. all `muted = false`
3. all `solo = false`

Expect:

1. all layers visible
2. all eye buttons shown as on
3. all show-only buttons shown as off

## Mute

### 2. Mute one layer

Action:

1. click `mute` on layer B

Expect:

1. only B becomes hidden
2. A and C remain visible
3. only B eye becomes off
4. no solo flags change

### 3. Unmute one layer

Action:

1. click `mute` again on layer B

Expect:

1. B becomes visible again
2. no solo flag becomes active
3. other layers do not change

## Solo

### 4. Solo one layer

Action:

1. click `show only` on layer B

Expect:

1. only B is visible
2. B solo is active
3. A and C solo are inactive
4. no mute flags change

### 5. Solo second layer

Action:

1. with B soloed, click `show only` on layer A

Expect:

1. A and B visible
2. C hidden
3. A solo active
4. B solo active
5. C solo inactive

### 6. Unsolo one layer from multi-solo

Action:

1. with A and B soloed, click `show only` on B

Expect:

1. only A remains soloed
2. only A visible
3. B and C hidden

### 7. Unsolo last solo layer

Action:

1. with only A soloed, click `show only` on A

Expect:

1. no solo layers remain
2. all non-muted layers visible

## Mixed mute and solo

### 8. Mute a soloed layer

Action:

1. solo B
2. mute B

Expect:

1. B becomes muted
2. B solo is cleared
3. all other non-muted layers become visible
4. no other layer gains solo automatically

### 9. Unmute previously soloed layer

Action:

1. after scenario 8, click mute on B again

Expect:

1. B becomes visible again
2. B solo stays off
3. no layer gains solo automatically

### 10. Mute a non-solo layer while another layer is soloed

Action:

1. solo B
2. mute A

Expect:

1. B remains visible
2. A remains not visible
3. C remains not visible because of solo
4. only A mute changes
5. B solo stays on

### 11. Unmute a layer while another layer is soloed

Action:

1. solo B
2. mute A
3. unmute A

Expect:

1. A still not visible because B is soloed
2. A is not muted anymore
3. B still soloed

## Multi-entity filtering

### 12. Pins respect the same visibility function

Expect:

1. pins are filtered only by `isVisible(collectionId)`

### 13. Paths respect the same visibility function

Expect:

1. traces are filtered only by `isVisible(collectionId)`

### 14. Areas respect the same visibility function

Expect:

1. areas are filtered only by `isVisible(collectionId)`

## UI consistency

### 15. Eye icon reflects mute state only

Expect:

1. eye icon must not appear off merely because another layer is soloed

### 16. Show-only icon reflects solo state only

Expect:

1. show-only icon must not deactivate because another layer changed mute

## Overlay consistency

### 17. Open pin overlay closes when its layer is not visible

### 18. Open path editor closes when its layer is not visible

### 19. Open area editor closes when its layer is not visible

These all must derive from the same `isVisible(collectionId)` rule.

## Legacy data

### 20. Entity without layer binding

Expect:

1. this is treated as a data problem
2. UI does not invent special mute/solo behavior for it
3. repair path is handled separately
