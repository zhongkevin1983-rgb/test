let audioCtx: AudioContext | null = null;
let oscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
let gainNode: GainNode | null = null;
let filterNode: BiquadFilterNode | null = null;
let turboOsc: OscillatorNode | null = null;
let turboGain: GainNode | null = null;
let isRunning = false;
let currentEngineType: 'v12' | 'v10' | 'v8' | 'v6' = 'v6';

export const initAudioCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const startEngine = (type: 'v12' | 'v10' | 'v8' | 'v6') => {
  try {
    initAudioCtx();
    if (!audioCtx) return;

    if (isRunning) {
      stopEngine();
    }

    currentEngineType = type;
    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime); // keep volume low and comfortable

    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(500, audioCtx.currentTime);

    // V6 Hybrid / V8 Screamer / V12 Classic setup
    if (type === 'v6') {
      // V6 Turbo hybrid: lower pitch, heavy low pass, plus a turbo whistle
      filterNode.frequency.setValueAtTime(350, audioCtx.currentTime);

      // Low grunt
      const osc1 = audioCtx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(70, audioCtx.currentTime);
      const oGain1 = audioCtx.createGain();
      oGain1.gain.setValueAtTime(0.8, audioCtx.currentTime);
      osc1.connect(oGain1);
      oGain1.connect(filterNode);
      osc1.start();
      oscillators.push({ osc: osc1, gain: oGain1 });

      const osc2 = audioCtx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(140, audioCtx.currentTime);
      const oGain2 = audioCtx.createGain();
      oGain2.gain.setValueAtTime(0.5, audioCtx.currentTime);
      osc2.connect(oGain2);
      oGain2.connect(filterNode);
      osc2.start();
      oscillators.push({ osc: osc2, gain: oGain2 });

      // Turbo whistle
      turboOsc = audioCtx.createOscillator();
      turboOsc.type = 'sine';
      turboOsc.frequency.setValueAtTime(1000, audioCtx.currentTime);
      turboGain = audioCtx.createGain();
      turboGain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      turboOsc.connect(turboGain);
      turboGain.connect(gainNode); // connect directly to skip lowpass filter
      turboOsc.start();

    } else if (type === 'v8') {
      // V8 Screamer: highly aggressive, wide sawing harmonics
      filterNode.frequency.setValueAtTime(800, audioCtx.currentTime);

      // Primary screaming frequency
      const frequencies = [160, 240, 320, 480];
      const gains = [0.6, 0.4, 0.3, 0.15];

      frequencies.forEach((f, idx) => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, audioCtx.currentTime);
        
        // Detune slightly for realistic chorus/motor feel
        osc.detune.setValueAtTime((Math.random() - 0.5) * 8, audioCtx.currentTime);

        const oGain = audioCtx.createGain();
        oGain.gain.setValueAtTime(gains[idx] || 0.2, audioCtx.currentTime);

        osc.connect(oGain);
        oGain.connect(filterNode!);
        osc.start();
        oscillators.push({ osc, gain: oGain });
      });

    } else if (type === 'v10') {
      // V10 Scream: legendary high-rev motorsport symphony
      filterNode.frequency.setValueAtTime(750, audioCtx.currentTime);

      const frequencies = [120, 240, 360, 480, 600];
      const gains = [0.6, 0.45, 0.35, 0.2, 0.1];

      frequencies.forEach((f, idx) => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, audioCtx.currentTime);
        osc.detune.setValueAtTime((Math.random() - 0.5) * 10, audioCtx.currentTime);

        const oGain = audioCtx.createGain();
        oGain.gain.setValueAtTime(gains[idx] || 0.2, audioCtx.currentTime);

        osc.connect(oGain);
        oGain.connect(filterNode!);
        osc.start();
        oscillators.push({ osc, gain: oGain });
      });

    } else {
      // V12 Classic: very rich mechanical rumble, balanced high and low
      filterNode.frequency.setValueAtTime(600, audioCtx.currentTime);

      const frequencies = [95, 190, 285, 380, 570];
      const gains = [0.7, 0.5, 0.4, 0.2, 0.1];

      frequencies.forEach((f, idx) => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, audioCtx.currentTime);
        osc.detune.setValueAtTime((Math.random() - 0.5) * 12, audioCtx.currentTime);

        const oGain = audioCtx.createGain();
        oGain.gain.setValueAtTime(gains[idx] || 0.2, audioCtx.currentTime);

        osc.connect(oGain);
        oGain.connect(filterNode!);
        osc.start();
        oscillators.push({ osc, gain: oGain });
      });
    }

    filterNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    isRunning = true;
  } catch (err) {
    console.error('Failed to start synthesis engine: ', err);
  }
};

export const setRPM = (rpmNormalized: number) => {
  // rpmNormalized is between 0 and 1 (idle of 0 to redline of 1)
  if (!isRunning || !audioCtx) return;

  const time = audioCtx.currentTime;

  if (currentEngineType === 'v6') {
    // V6 pitch sweep (idle~low ~ max engine rev)
    const baseFreq = 70 + rpmNormalized * 150; // 70Hz - 220Hz
    if (oscillators[0]) {
      oscillators[0].osc.frequency.setTargetAtTime(baseFreq, time, 0.1);
    }
    if (oscillators[1]) {
      oscillators[1].osc.frequency.setTargetAtTime(baseFreq * 2, time, 0.1);
    }
    // Filter opens up as RPM climbs
    if (filterNode) {
      filterNode.frequency.setTargetAtTime(350 + rpmNormalized * 600, time, 0.1);
    }
    // Turbo rises significantly in pitch and decibels
    if (turboOsc && turboGain) {
      turboOsc.frequency.setTargetAtTime(1000 + rpmNormalized * 2200, time, 0.05);
      turboGain.gain.setTargetAtTime(0.01 + rpmNormalized * 0.06, time, 0.1);
    }

  } else if (currentEngineType === 'v8') {
    // V8 high-rev screaming sweep
    const mults = [1, 1.5, 2, 3];
    const baseFreq = 160 + rpmNormalized * 600; // 160Hz - 760Hz (redlining extremely high!)
    
    oscillators.forEach((oscObj, idx) => {
      const mult = mults[idx] || 1;
      oscObj.osc.frequency.setTargetAtTime(baseFreq * mult, time, 0.08);
    });

    if (filterNode) {
      filterNode.frequency.setTargetAtTime(800 + rpmNormalized * 2500, time, 0.1);
    }

  } else if (currentEngineType === 'v10') {
    // V10 legendary scream high-frequency multiplier
    const mults = [1, 2, 3, 4, 5];
    const baseFreq = 120 + rpmNormalized * 500; // 120Hz - 620Hz
    
    oscillators.forEach((oscObj, idx) => {
      const mult = mults[idx] || 1;
      oscObj.osc.frequency.setTargetAtTime(baseFreq * mult, time, 0.08);
    });

    if (filterNode) {
      filterNode.frequency.setTargetAtTime(750 + rpmNormalized * 2200, time, 0.1);
    }

  } else {
    // V12 musical mechanical sweep
    const mults = [1, 2, 3, 4, 6];
    const baseFreq = 95 + rpmNormalized * 400; // 95Hz - 495Hz
    
    oscillators.forEach((oscObj, idx) => {
      const mult = mults[idx] || 1;
      oscObj.osc.frequency.setTargetAtTime(baseFreq * mult, time, 0.08);
    });

    if (filterNode) {
      filterNode.frequency.setTargetAtTime(600 + rpmNormalized * 1800, time, 0.1);
    }
  }

  // Engine is slightly louder of course under high throttle/RPM
  if (gainNode) {
    gainNode.gain.setTargetAtTime(0.04 + rpmNormalized * 0.06, time, 0.05);
  }
};

export const stopEngine = () => {
  setIsMuted(true);
};

export const setIsMuted = (muted: boolean) => {
  if (muted) {
    oscillators.forEach(oscObj => {
      try {
        oscObj.osc.stop();
      } catch (e) {}
    });
    oscillators = [];

    if (turboOsc) {
      try {
        turboOsc.stop();
      } catch (e) {}
      turboOsc = null;
    }

    gainNode = null;
    filterNode = null;
    turboGain = null;
    isRunning = false;
  }
};
