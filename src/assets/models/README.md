# 3D GLB Models Directory (Src Assets Folder)

If you prefer to place your `.glb` or `.gltf` 3D car models in the `/src/assets/models/` folder, please note that you'll need to use ESM imports in your source code, like:
```ts
import sf24Model from './models/ferrari_sf24.glb';
```

## Recommended Alternative
For dynamic loading by Three.js GLTFLoader based on list data, **it is highly recommended** to put your 3D models into the `/public/models/` directory instead. This allows direct client requests via:
`/models/your_model.glb`
