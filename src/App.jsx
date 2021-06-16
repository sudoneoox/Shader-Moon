import React, { Suspense, useRef } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { OrbitControls, shaderMaterial } from '@react-three/drei';
import { useControls } from 'leva';
import ReactDOM from 'react-dom';
import './index.css';


import Stats from './Components/Stats/Stats';
import makeControls from './Components/Tools/makeControls';
import VertexMoon from './Components/Shader/Vertex.glsl';
import FragmentMoon from './Components/Shader/Fragment.glsl';


const ShaderMoon = shaderMaterial(
    {
        time: 0.0,
        RGBr: 0.0,
        RGBg: 0.0,
        RGBb: 0.0,
        RGBn: 0.0,
        RGBm: 0.0,
        morph: 0.0,
        dnoise: 0.0,
        psize: 3.0
    },
    VertexMoon,
    FragmentMoon,
    (self) => {
        self.vertexColors = true;
        self.needsUpdate = true;
    }
);
extend({ ShaderMoon });

function Moon() {
    const pointsMaterial = useRef();
    const meshMaterial = useRef();
    const group = useRef();

    const { visible, wireframe } = useControls("Sphere", { visible: true, wireframe: false });
    const { speed, red, green, blue, black, alpha, noise, morph, pointSize } = useControls('UNIFORMS',
        {
            "speed": { "value": 0.0, "min": 0, "max": 3 },
            "red": { "value": 4.5, "min": 0, "max": 10 },
            "green": { "value": 0.0, "min": 0, "max": 10 },
            "blue": { "value": 3, "min": 0, "max": 10 },
            "black": { "value": 0.3, "min": 0, "max": 3 },
            "alpha": { "value": 1.0, "min": 0, "max": 1.0 },
            "noise": { "value": 2.5, "min": 0, "max": 100 },
            "morph": { "value": 0.0, "min": 0, "max": 20 },
            "pointSize": { "value": 3, "min": 1, "max": 10, "step": 1 },
        });
    const { Zoom, Grid } = useControls('Camera', { 'Zoom': { "value": 150, 'min': 50, 'max': 250 }, "Grid": false, });
    useFrame((state, delta) => {
        let time = state.clock.elapsedTime * speed;
        pointsMaterial.current.uniforms.time.value = time;
        pointsMaterial.current.uniforms.dnoise.value = noise;
        pointsMaterial.current.uniforms.morph.value = morph;
        pointsMaterial.current.uniforms.RGBr.value = red / 10;
        pointsMaterial.current.uniforms.RGBg.value = green / 10;
        pointsMaterial.current.uniforms.RGBb.value = blue / 10;
        pointsMaterial.current.uniforms.RGBn.value = black / 100;
        pointsMaterial.current.uniforms.RGBm.value = alpha;
        pointsMaterial.current.uniforms.psize.value = pointSize;

        meshMaterial.current.uniforms.time.value = time;
        meshMaterial.current.uniforms.dnoise.value = noise;
        meshMaterial.current.uniforms.morph.value = morph;
        meshMaterial.current.uniforms.RGBr.value = red / 10;
        meshMaterial.current.uniforms.RGBg.value = green / 10;
        meshMaterial.current.uniforms.RGBb.value = blue / 10;
        meshMaterial.current.uniforms.RGBn.value = black / 100;
        meshMaterial.current.uniforms.RGBm.value = alpha;
        meshMaterial.current.uniforms.psize.value = pointSize;

        group.current.rotation.x = group.current.rotation.y = group.current.rotation.z += delta / 2;

        state.camera.position.z = Zoom;
        state.scene.children[0].visible = Grid;
    });
    return (
        <>
            <group ref={group}
                updateMorphTargets
                receiveShadow
                castShadow
                dispose={null}>
                <mesh scale={[1, 1, 1]}
                    visible={!visible}>
                    <icosahedronBufferGeometry args={[20, 20]} />
                    <shaderMoon attach="material" ref={meshMaterial} wireframe={wireframe} />
                </mesh>
                <points visible={visible} >
                    <icosahedronBufferGeometry args={[20, 35]} />
                    <shaderMoon attach="material" ref={pointsMaterial} />
                </points>
            </group>
        </>
    );
}




function Main() {

    return (
        <>
            <Canvas
                gl={{ antialias: true, alpha: false, shadowMap: true }}
                camera={{ position: [0, 0, 150], fov: 20, near: 1, far: 1000, }}>
                <Suspense fallback={null}>
                    <gridHelper args={[200, 20, "#444444", "#222222"]} position={[null, -20, null]} />
                    <hemisphereLight args={['#444444', '#ffffff']} />
                    <pointLight args={['#ffffff', 1]} position={[-5, -20, -20]} />
                    <rectAreaLight args={['#ffffff', 20, 3, 3]} position={[0, 0, 2]} />
                    <pointLight args={['#ffffff', 2]} position={[20, 10, 0]} />
                    <fog attach="fog" args={['#000000', 150, 320]} />
                    <Moon />
                    <color args={['#000']} attach="background" />
                    <OrbitControls />
                    <Stats />
                </Suspense>
            </Canvas>
        </>
    );
}

ReactDOM.render(
    <>
        <Main />
    </>
    ,
    document.getElementById('root')
);