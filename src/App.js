import React, { createRef, forwardRef } from "react";
import { StyleSheet, TouchableOpacity, Platform } from "react-native";
// import { Svg, Defs, Marker, G, Path } from "./react-native-svg";
import {
  Svg,
  Defs,
  Marker,
  G,
  Path
} from "react-native-svg/src/ReactNativeSVG.web";

const ForwardPath = forwardRef((props, ref) => {
  return <Path {...props} forwardedRef={ref} />;
});

const isWeb = Platform.OS === "web";
const PlatformPath = isWeb ? ForwardPath : Path;

function createPoint(element, options) {
  const point = element.ownerSVGElement.createSVGPoint();
  point.x = options.x;
  point.y = options.y;
  return point;
}

function alertResults(
  options,
  isPointInFill,
  isPointInStroke,
  totalLength,
  pointAtHalfLength,
  BBox,
  CTM,
  screenCTM,
  inverse,
  screenPoint
) {
  const mKeys = ["a", "b", "c", "d", "e", "f"];
  const boxKeys = ["x", "y", "width", "height"];
  const message = `isPointInFill: ${JSON.stringify(options)} ${isPointInFill}
isPointInStroke: ${JSON.stringify(options)} ${isPointInStroke}
totalLength: ${totalLength}
pointAtHalfLength: ${pointAtHalfLength.x} ${pointAtHalfLength.y}
BBox: ${boxKeys.map(k => `${k}: ${BBox[k]}`)}
CTM: ${mKeys.map(k => `${k}: ${CTM[k]}`)}
screenCTM: ${mKeys.map(k => `${k}: ${screenCTM[k]}`)}
inverse: ${mKeys.map(k => `${k}: ${inverse[k]}`)}
screenPoint: ${screenPoint.x} ${screenPoint.y}`;
  alert(message);
}

async function testNativeMethods(element) {
  const notInStroke = { x: 168, y: 85 };
  const insideStrokeAndFill = { x: 138, y: 58 };
  const testStroke = false;
  const option = testStroke ? notInStroke : insideStrokeAndFill;
  const point = createPoint(element, option);
  const CTM = await element.getCTM();
  const BBox = await element.getBBox();
  const screenCTM = await element.getScreenCTM();
  const inverse = screenCTM.inverse();
  const screenPoint = point.matrixTransform(inverse);
  const totalLength = await element.getTotalLength();
  const pointAtHalfLength = await element.getPointAtLength(totalLength / 2);
  const isPointInFill = await element.isPointInFill(point);
  const isPointInStroke = await element.isPointInStroke(point);
  alertResults(
    point,
    isPointInFill,
    isPointInStroke,
    totalLength,
    pointAtHalfLength,
    BBox,
    CTM,
    screenCTM,
    inverse,
    screenPoint
  );
}

export default class App extends React.Component {
  refPath = createRef();
  render() {
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={() => {
          testNativeMethods(this.refPath.current);
        }}
      >
        <Svg
          xmlns="http://www.w3.org/2000/svg"
          width="275"
          height="200"
          viewBox="0 0 275 200"
        >
          <Defs>
            <Marker
              id="Triangle"
              viewBox="0 0 10 10"
              refX="1"
              refY="5"
              markerUnits="strokeWidth"
              markerWidth="4"
              markerHeight="3"
              orient="auto"
            >
              <Path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
            </Marker>
          </Defs>

          <G fill="none" strokeWidth="10" markerEnd="url(#Triangle)">
            <PlatformPath
              ref={this.refPath}
              stroke="crimson"
              d="M 100,75 C 125,50 150,50 175,75"
              markerEnd="url(#Triangle)"
            />
            <PlatformPath
              stroke="olivedrab"
              d="M 175,125 C 150,150 125,150 100,125"
              markerEnd="url(#Triangle)"
            />
          </G>
        </Svg>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  }
});
