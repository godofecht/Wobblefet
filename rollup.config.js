import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const builds = [
    {
        input: "script/component.js",
        output: [
            {
                format: "esm",
                file: "pink-trombone.min.js",
            },
        ],
        plugins: [resolve(), commonjs()]
    },
    {
        input: "script/audio/nodes/pinkTrombone/processors/WorkletProcessor.js",
        output: [
            {
                format: "esm",
                file: "pink-trombone-worklet-processor.min.js",
            },
        ],
        plugins: [resolve(), commonjs()]
    },
];

export default (args) => builds;
