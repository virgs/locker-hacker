import * as React from "react";

import Point from "./Point.tsx";
import Connectors from "./Connectors.tsx";
import { PatternLockStyles } from "./PatternLock.styled.tsx";

import {
  getPoints,
  getCollidedPointIndex,
  getPointsInTheMiddle,
} from "../math/math.ts";
import { Point as PointType } from "../math/point.ts";
import classnames from "classnames";

interface PatternLockProps {
  path: number[];
  width?: number | string;
  size?: number;
  pointActiveSize?: number;
  connectorThickness?: number;
  connectorRoundedCorners?: boolean;
  pointSize?: number;
  disabled?: boolean;
  error?: boolean;
  success?: boolean;
  allowOverlapping?: boolean;
  allowJumping?: boolean;
  style?: React.CSSProperties;
  className?: string;
  noPop?: boolean;
  invisible?: boolean;

  onChange(path: number[]): void;
  onFinish(): void;
}

const PatternLock: React.FunctionComponent<PatternLockProps> = ({
  width = "100%",
  size = 5,
  pointActiveSize = 30,
  pointSize = 20,
  connectorThickness = 6,
  connectorRoundedCorners = false,
  disabled = false,
  error = false,
  success = false,
  allowOverlapping = false,
  noPop = false,
  invisible = false,
  allowJumping = false,
  className = "",
  style = {},
  onChange,
  onFinish,
  path,
}) => {
  const wrapperRef = React.useRef<HTMLDivElement>(
    document.createElement("div")
  );
  const [height, setHeight] = React.useState<number>(0);
  const [points, setPoints] = React.useState<PointType[]>([]);
  const [position, setPosition] = React.useState<PointType>({ x: 0, y: 0 });
  const [isMouseDown, setIsMouseDown] = React.useState<boolean>(false);
  const [initialMousePosition, setInitialMousePosition] =
    React.useState<PointType | null>(null);

  const checkCollision = ({ x, y }: PointType): void => {
    const { top, left } = wrapperRef.current.getBoundingClientRect();
    const mouse = { x: x - left, y: y - top }; // relative to the container as opposed to the screen
    const index = getCollidedPointIndex(mouse, points, pointActiveSize);
    if (~index && path[path.length - 1] !== index) {
      if (allowOverlapping || path.indexOf(index) === -1) {
        if (allowJumping || !path.length) {
          onChange([...path, index]);
        } else {
          const pointsInTheMiddle = getPointsInTheMiddle(
            path[path.length - 1],
            index,
            size
          );
          if (allowOverlapping) {
            onChange([...path, ...pointsInTheMiddle, index]);
          } else {
            onChange([
              ...path,
              ...pointsInTheMiddle.filter(
                (point) => path.indexOf(point) === -1
              ),
              index,
            ]);
          }
        }
      }
    }
  };

  const onResize = () => {
    const { top, left } = wrapperRef.current.getBoundingClientRect();
    setPosition({ x: left + window.scrollX, y: top + window.scrollY });
    return [top, left];
  };

  const onHold = ({ clientX, clientY }: React.MouseEvent) => {
    if (disabled) return;
    const [top, left] = onResize(); // retrieve boundingRect and force setPosition
    setInitialMousePosition({ x: clientX - left, y: clientY - top });
    setIsMouseDown(true);
    checkCollision({ x: clientX, y: clientY });
  };

  const onTouch = ({ touches }: React.TouchEvent) => {
    if (disabled) return;
    const [top, left] = onResize(); // retrieve boundingRect and force setPosition
    setInitialMousePosition({
      x: touches[0].clientX - left,
      y: touches[0].clientY - top,
    });
    setIsMouseDown(true);
    checkCollision({ x: touches[0].clientX, y: touches[0].clientY });
  };

  React.useEffect(() => {
    const ref = wrapperRef.current;

    if (!isMouseDown) return;
    const onMouseMove = ({ clientX, clientY }: MouseEvent): void =>
      checkCollision({ x: clientX, y: clientY });
    const onTouchMove = ({ touches }: TouchEvent): void =>
      checkCollision({ x: touches[0].clientX, y: touches[0].clientY });
    ref.addEventListener("mousemove", onMouseMove);
    ref.addEventListener("touchmove", onTouchMove);
    return () => {
      ref.removeEventListener("mousemove", onMouseMove);
      ref.removeEventListener("touchmove", onTouchMove);
    };
  });

  React.useEffect(() => setHeight(wrapperRef.current.offsetWidth), []);
  React.useEffect(() => {
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  React.useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      setPoints(getPoints({ pointActiveSize, height, size }));
      onResize();
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [height, pointActiveSize, size]);

  React.useEffect(() => {
    const onRelease = () => {
      setIsMouseDown(false);
      setInitialMousePosition(null);
      if (!disabled && path.length) onFinish();
    };

    window.addEventListener("mouseup", onRelease);
    window.addEventListener("touchend", onRelease);

    return () => {
      window.removeEventListener("mouseup", onRelease);
      window.removeEventListener("touchend", onRelease);
    };
  }, [disabled, path, onFinish]);

  return (
    <>
      <PatternLockStyles />
      <div
        className={classnames([
          "react-pattern-lock__pattern-wrapper",
          { error, success, disabled },
          className,
        ])}
        style={{ ...style, width, height }}
        onMouseDown={onHold}
        onTouchStart={onTouch}
        ref={wrapperRef}
      >
        {Array.from({ length: size ** 2 }).map((_, i) => (
          <Point
            key={i}
            index={i}
            size={size}
            pointSize={pointSize}
            pointActiveSize={pointActiveSize}
            pop={!noPop && isMouseDown && path[path.length - 1] === i}
            selected={path.indexOf(i) > -1}
          />
        ))}
        {!invisible && points.length && (
          <Connectors
            initialMousePosition={initialMousePosition}
            wrapperPosition={position}
            path={path}
            points={points}
            pointActiveSize={pointActiveSize}
            connectorRoundedCorners={connectorRoundedCorners}
            connectorThickness={connectorThickness}
          />
        )}
      </div>
    </>
  );
};

export default PatternLock;
