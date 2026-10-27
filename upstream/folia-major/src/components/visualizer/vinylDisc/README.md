# Vinyl Disc

Adapted from [Zhangyx0824/folia-mod-vinyl-disc](https://github.com/Zhangyx0824/folia-mod-vinyl-disc),
version 1.7.11, commit `5acb6a14e323de97caf6fd5e15d866ce8a31dd52`.
Copyright (c) 2026 pomepii; complete MIT terms in `LICENSE`.

`vendor/client.mjs` retains the upstream DOM artwork and schema. Local changes:
font-weight resolution for surrounding lyrics, invalidated typography on resize,
bounded cover cache and cleared image timeout. Landscape lyrics are 30% larger than the
upstream baseline; tall landscape stages show up to nine lyric rows
instead of seven to use the vertical space. Metadata retains its original size and
layout, with solid light/dark ink, stronger weights and a small opposing shadow
for readability over the host background. Disc geometry is unchanged.
`adapter.ts` maps the newer mod
callbacks to the existing Folium stage, clock and native app visibility without
a second animation loop. Parameters use the existing Folium persistence and
visual-config import/export path (`visualizer:vinyl-disc:disc`).

The registry entry is lightweight; renderer and settings load on demand.
