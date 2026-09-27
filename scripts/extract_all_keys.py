import subprocess, json, os

files = [
    'build-a-nucleus.html', 'bending-light.html', 'faradays-electromagnetic-lab.html',
    'geometric-optics-basics.html', 'pendulum-lab.html', 'wave-interference.html',
    'natural-selection.html', 'my-solar-system.html', 'ph-scale.html',
    'neuron.html', 'quadrilateral.html', 'hookes-law.html',
    'quantum-measurement.html', 'balloons-and-static-electricity.html',
    'projectile-sampling-distributions.html'
]

node_script = """
const fs = require('fs');
const fname = process.argv[1];
const c = fs.readFileSync('public/simulations/' + fname, 'utf8');

const window = { phet: { chipper: {} } };
const pos_s = c.indexOf('window.phet.chipper.strings');
const pos_m = c.indexOf('window.phet.chipper.stringMetadata');

if (pos_s !== -1 && pos_m !== -1) {
    const chunk = c.slice(pos_s, pos_m);
    try {
        eval(chunk);
        const en = window.phet.chipper.strings ? window.phet.chipper.strings.en : null;
        if (en) {
            console.log(JSON.stringify(en));
        } else {
            console.log(JSON.stringify({}));
        }
    } catch(e) {
        console.log(JSON.stringify({}));
    }
} else {
    console.log(JSON.stringify({}));
}
"""

all_untranslated = {}
for fname in files:
    res = subprocess.run(['node', '-e', node_script, fname], capture_output=True, text=True)
    try:
        data = json.loads(res.stdout)
        # filter keys that still have english letters in value
        sim_keys = {k: v for k, v in data.items() if not k.startswith(('JOIST', 'SCENERY', 'SUN', 'TAMBO', 'VEGAS', 'GRIDDLE', 'SHRED')) and any(c.isalpha() and ord(c) < 128 for c in v)}
        all_untranslated[fname] = sim_keys
        print(f'{fname}: {len(sim_keys)} untranslated keys')
    except Exception as e:
        print(f'{fname}: error {e}')

with open('/tmp/untranslated_summary.json', 'w', encoding='utf-8') as f:
    json.dump(all_untranslated, f, ensure_ascii=False, indent=2)

