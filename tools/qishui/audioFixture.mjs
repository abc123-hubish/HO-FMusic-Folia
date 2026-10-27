// A quiet, decodable PCM fixture; proves media clocks and seeking without downloading songs.
export function makeAudioFixture(seconds = 60) {
  const rate = 8000, samples = rate * seconds;
  const audio = Buffer.alloc(44 + samples * 2);
  audio.write('RIFF'); audio.writeUInt32LE(audio.length - 8, 4); audio.write('WAVEfmt ', 8);
  audio.writeUInt32LE(16, 16); audio.writeUInt16LE(1, 20); audio.writeUInt16LE(1, 22);
  audio.writeUInt32LE(rate, 24); audio.writeUInt32LE(rate * 2, 28); audio.writeUInt16LE(2, 32);
  audio.writeUInt16LE(16, 34); audio.write('data', 36); audio.writeUInt32LE(samples * 2, 40);
  for (let index = 0; index < samples; index++) audio.writeInt16LE(Math.round(200 * Math.sin(index * 440 * 2 * Math.PI / rate)), 44 + index * 2);
  return audio;
}
