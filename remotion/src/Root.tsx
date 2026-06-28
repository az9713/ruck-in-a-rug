import {Composition} from 'remotion';
import {Cycloid} from './Cycloid';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Cycloid"
      component={Cycloid}
      durationInFrames={360}
      fps={30}
      width={1280}
      height={720}
    />
  );
};
