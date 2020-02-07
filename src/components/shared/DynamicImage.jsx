import React from 'react';

const DynamicImage = ({
  noStyles,
  ariaHidden,
  srcProp,
  classProp,
  altProp,
  onClickProp,
  refProp
}) => {
  const defaultPath = require(`../../${srcProp}.jpg`);

  const srcSetPaths = {
    '400w': require(`../../${srcProp}_400.jpg`),
    '800w': require(`../../${srcProp}_800.jpg`),
    '1100w': require(`../../${srcProp}_1100.jpg`),
    '1500w': require(`../../${srcProp}_1500.jpg`),
    '2000w': require(`../../${srcProp}_2000.jpg`),
    '2500w': require(`../../${srcProp}_2500.jpg`)
  };

  const srcSet = Object.entries(srcSetPaths)
    .map(([name, path]) => `${path} ${name}`)
    .join(', ');

  return (
    <img
      style={noStyles ? {} : { maxWidth: '100%', maxHeight: '100%' }}
      src={defaultPath}
      srcSet={srcSet}
      alt={altProp}
      ref={refProp || null}
      className={`responsive-img${classProp ? ` ${classProp}` : ''}`}
      onClick={onClickProp}
      aria-hidden={ariaHidden ? true : false}
    />
  );
};

export default DynamicImage;
