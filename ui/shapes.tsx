import * as React from "react";
import Svg, { ClipPath, Defs, G, Path } from "react-native-svg";

interface shapeProps {
  color: string;
  size: number;
}

export const shape1 = (props: shapeProps) => (
  <Svg
    width={props.size}
    height={props.size}
    viewBox="0 0 200 200"
    fill="none"
    {...props}
  >
    <G clipPath="url(#a)">
      <Path
        fill={props.color}
        d="M127.14 200c-27.146 0-27.146-32.577-54.291-32.577-31.244 0-72.849-9.037-72.849-40.29 0-27.144 32.568-27.144 32.568-54.288C32.568 41.613 41.605 0 72.86 0c27.146 0 27.146 32.577 54.291 32.577 31.233 0 72.849 9.037 72.849 40.29 0 27.145-32.579 27.145-32.579 54.289-.012 31.288-9.037 72.844-40.281 72.844Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h200v200H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);

export const shape2 = (props: shapeProps) => (
  <Svg
    width={props.size}
    height={props.size}
    viewBox="0 0 200 200"
    fill="none"
    {...props}
  >
    <G clipPath="url(#a)">
      <Path
        fill={props.color}
        d="M100 173.738C24.364 236.944-36.944 175.636 26.262 100-36.944 24.364 24.364-36.944 100 26.262c75.621-63.206 136.944-1.898 73.738 73.738 63.206 75.578 1.883 136.944-73.738 73.738Z"
      />
    </G>
  </Svg>
);

export const shape3 = (props: shapeProps) => (
  <Svg
    width={props.size}
    height={props.size}
    viewBox="0 0 200 200"
    fill="none"
    {...props}
  >
    <G clipPath="url(#a)">
      <Path
        fill={props.color}
        fillRule="evenodd"
        d="M100 22c0-12.15-9.85-22-22-22H22C9.85 0 0 9.85 0 22v56.72c0 12.15 9.85 21.999 22 21.999h56c12.15 0 22 9.85 22 22V178c0 12.15 9.85 22 22 22h56c12.15 0 22-9.85 22-22v-56.72c0-12.15-9.85-22-22-22h-56c-12.15 0-22-9.85-22-22V22Z"
        clipRule="evenodd"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h200v200H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);

export const shape4 = (props: shapeProps) => (
  <svg
    width={props.size}
    height={props.size}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 200 200"
    version="1.1"
  >
    <g clipPath="url(#clip0_105_480)">
      <path
        fill={props.color}
        fillRule="evenodd"
        d="M124.899 4.917 105.8 85.998l43.827-70.838a4 4 0 0 1 6.23-.724l29.707 29.707a4 4 0 0 1-.724 6.23L114.002 94.2l81.081-19.099A4 4 0 0 1 200 78.995v42.011a4 4 0 0 1-4.917 3.893L114.002 105.8l70.838 43.828a4 4 0 0 1 .724 6.23l-29.707 29.706a4 4 0 0 1-6.23-.724L105.8 114.002l19.099 81.081a4 4 0 0 1-3.893 4.917H78.994a4 4 0 0 1-3.893-4.917l19.1-81.081-43.828 70.838a4 4 0 0 1-6.23.724l-29.707-29.707a4 4 0 0 1 .724-6.23L85.998 105.8l-81.08 19.099A4 4 0 0 1 0 121.006V78.994a4 4 0 0 1 4.917-3.893l81.081 19.1L15.16 50.372a4 4 0 0 1-.724-6.23l29.707-29.707a4 4 0 0 1 6.23.724L94.2 85.998 75.1 4.918A4 4 0 0 1 78.995 0h42.012a4 4 0 0 1 3.893 4.917ZM100 111.43c6.312 0 11.429-5.117 11.429-11.429s-5.117-11.43-11.429-11.43S88.571 93.688 88.571 100s5.117 11.429 11.429 11.429Z"
        clipRule="evenodd"
      ></path>
    </g>
  </svg>
);

export const shape7 = (props: shapeProps) => (
  <Svg
    width={props.size}
    height={props.size}
    viewBox="0 0 200 200"
    fill="none"
    {...props}
  >
    <G clipPath="url(#a)">
      <Path
        fill={props.color}
        d="M100 0c.014 36.893 44.613 55.367 70.711 29.29C144.633 55.386 163.107 99.985 200 100c-36.893.014-55.367 44.613-29.289 70.711C144.613 144.633 100.014 163.107 100 200c-.014-36.893-44.613-55.367-70.71-29.289C55.366 144.613 36.892 100.014 0 100c36.893-.014 55.367-44.613 29.29-70.71C55.386 55.366 99.985 36.892 100 0Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h200v200H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);

export const shape5 = (props: shapeProps) => (
  <Svg
    width={props.size}
    height={props.size}
    viewBox="0 0 200 200"
    fill="none"
    {...props}
  >
    <G clipPath="url(#a)">
      <Path
        fill={props.color}
        d="M71.558 16.335c12.778-21.78 44.267-21.78 57.045 0l.464.79a33.07 33.07 0 0 0 28.291 16.335l.918.006c25.251.177 40.995 27.446 28.522 49.403l-.453.797a33.07 33.07 0 0 0 0 32.668l.453.797c12.473 21.957-3.271 49.226-28.522 49.403l-.918.006a33.073 33.073 0 0 0-28.291 16.334l-.464.791c-12.778 21.78-44.267 21.78-57.045 0l-.464-.791a33.072 33.072 0 0 0-28.291-16.334l-.917-.006c-25.251-.177-40.995-27.446-28.523-49.403l.453-.797a33.07 33.07 0 0 0 0-32.668l-.453-.797C.89 60.912 16.635 33.643 41.886 33.466l.917-.006a33.07 33.07 0 0 0 28.29-16.334l.465-.791Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h200v200H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);

export const shape6 = (props: shapeProps) => (
  <Svg
    width={props.size}
    height={props.size}
    viewBox="0 0 200 200"
    fill="none"
    {...props}
  >
    <Path
      fill={props.color}
      d="M100.106 0 115 54.16l43.884-35.062-19.784 52.57 56.111-2.57L148.306 100l46.905 30.902-56.111-2.571 19.784 52.571L115 145.841 100.106 200l-14.895-54.159-43.884 35.061 19.784-52.571L5 130.902 51.906 100 5 69.098l56.111 2.57-19.784-52.57L85.211 54.16 100.106 0Z"
    />
  </Svg>
);
