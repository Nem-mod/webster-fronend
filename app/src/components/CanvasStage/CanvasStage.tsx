import Konva from 'konva';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Layer, Line, Rect, Stage, Transformer } from 'react-konva';
import useCanvasTransition from '../../hooks/canvas/useTransition';
import { useAppDispatch } from '../../hooks/redux';
import {
	addElement,
	ICanvasState,
	updateElement,
} from '../../redux/slices/canvasSlice/canvas-slice';
import { ICanvasElement } from '../../services/canvas/canvas.types';
import CanvasElement from './CanvasElement';
import { useDropzone } from 'react-dropzone';
import { FileUploaderService } from '../../services/file-uploader/file-uploader.service';
import { CanvasElementType } from '../../services/canvas/canvas-element-types.enum';
import { useDraw } from '../../hooks/canvas/useDraw';
import CanvasEditBar from '../CanvasEditBar/CanvasEditBar';
import useCanvasKeyboard from '../../hooks/canvas/useCanvasKeyboard';
import useWheel from '../../hooks/canvas/useWheel';
import useWindowDimensions from "../../hooks/UseWindowDimensions.tsx";

interface Props {
	canvasState: ICanvasState;
	dimensions: {
		width: number;
		height: number;
	};
	stageRef: any;
	stageWrapperRef: any;
}

/**
 * 	const handleStageDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
 setStageDrag(true);
 };

 const handleStageDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
 setStageDrag(false);
 };

 const handleStageDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
 if (!stageDrag) return;

 const stage = e.target.getStage();

 setStageScale({
 ...stageScale,
 stageX: stage?.x() + e.evt.movementX,
 stageY: stage?.y() + e.evt.movementY,
 });
 };

 */

// TODO: Refactor code, use custom hooks to short code
export const CanvasStage = ({
	canvasState,
	stageRef,
	stageWrapperRef,
}: Props) => {
	const [defaultScale, setDefaultScale] = useState(1);
	const { height, width } = useWindowDimensions()

	useEffect(() => {
		const stageWrapperBounds = stageWrapperRef.current.getBoundingClientRect()
		const divRefBounds = divRef.current.getBoundingClientRect()
		const minHeightDelta = 120
		const minWidthDelta = 300

		// console.log('start')
		// console.log(`outer: ${stageWrapperBounds.height} | inner: ${divRefBounds.height}`);

		// const newScale = 1
		// const newScale = Math.abs(120 / (stageWrapperBounds.height - divRefBounds.height))
		const newScaleY = (stageWrapperBounds.height - minHeightDelta) / divRefBounds.height * defaultScale;
		const newScaleX = (stageWrapperBounds.width - minWidthDelta) / divRefBounds.width * defaultScale;
		const newScale = Math.abs(Math.min(newScaleX, newScaleY))

		// console.log(`old scale: ${defaultScale} | new scale: ${newScale}`);
		// console.log(`new outer: ${stageWrapperBounds.height / defaultScale * newScale} | new inner: ${divRefBounds.height / defaultScale * newScale}`);
		// console.log('end')

		// setDefaultScale(Math.min(
		// 	624.9857 * Math.pow(Math.max(dimensions.height, dimensions.width), -0.993),
		// 	0.9
		// ))

		stageWrapperRef.current.style.height = `${
			stageWrapperRef.current.style.height / defaultScale * newScale
		}px`;

		setDefaultScale(newScale)
		// stageWrapperRef.current.style.maxHeight = `${
		// 	stageWrapperRef.current.style.height * defaultScale
		// }px`;
		// stageWrapperRef.current.style.width = `${stageWrapperRef.current.style.width * defaultScale}px`
	}, [stageRef, height]);

	const shapes = canvasState.data?.elements;
	const dispatch = useAppDispatch();
	const divRef = useRef<HTMLInputElement>(null);

	useCanvasKeyboard();
	const [stageScale, setStageScale] = useState({
		scale: 1,
		stageX: 0,
		stageY: 0,
	});
	const handleWheel = useWheel(stageScale, setStageScale);
	const {
		line,
		tool,
		drawingHandleMouseDown,
		drawingHandleMouseMove,
		drawingHandleMouseUp,
	} = useDraw();

	const {
		trRef,
		layerRef,
		selectionRectRef,
		checkDeselect,
		onMouseDown,
		onMouseUp,
		onMouseMove,
		onClickTap,
	} = useCanvasTransition(canvasState.data?.selected || []);

	const handleChangeElement = (
		index: number,
		element: Partial<ICanvasElement>
	) => {
		dispatch(
			updateElement({
				index,
				element,
			})
		);
	};

	// File Drop Zone
	const onDrop = useCallback((acceptedFiles: File[]) => {
		acceptedFiles.forEach((file: File) => {
			if (file.type.includes('image')) {
				FileUploaderService.uploadImage(file).then((res: { url: string }) => {
					dispatch(
						addElement({
							type: CanvasElementType.IMAGE,
							src: res?.url,
							// TODO: Create Image element on point of drop if it possible
							x: 100,
							y: 100,
						})
					);
				});
			}
		});
	}, []);

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		noClick: true,
	});
	return (
		<div
			ref={divRef}
			className={'border-2 border-accent-dark'}
			style={{ transform: `scale(${defaultScale})`, transformOrigin: 'center' }}
		>
			<div {...getRootProps()}>
				<Stage
					ref={stageRef}
					onWheel={handleWheel}
					scaleX={stageScale.scale}
					scaleY={stageScale.scale}
					x={stageScale.stageX}
					y={stageScale.stageY}
					width={canvasState.data?.resolution[0]}
					height={canvasState.data?.resolution[1]}
					onMouseDown={tool ? drawingHandleMouseDown : onMouseDown}
					onMouseUp={tool ? drawingHandleMouseUp : onMouseUp}
					onMouseMove={tool ? drawingHandleMouseMove : onMouseMove}
					onTouchStart={checkDeselect}
					onClick={onClickTap}
					onTap={onClickTap}
				>
					<Layer ref={layerRef}>
						{shapes?.map((shape, index) => {
							shape = {
								...shape,
								id: `${shape.type}-${index}`,
								draggable: true,
							};
							return (
								<CanvasElement
									key={index}
									getKey={index}
									shape={shape}
									index={index}
									onChange={handleChangeElement}
								/>
							);
						})}
						{line && (
							<Line
								points={line.points}
								stroke={canvasState.data?.activeTool?.color || '#df4b26'}
								strokeWidth={5}
								tension={0.5}
								lineCap='round'
								lineJoin='round'
							/>
						)}
						<Transformer
							ref={trRef}
							boundBoxFunc={(oldBox, newBox) => {
								if (newBox.width < 5 || newBox.height < 5) {
									return oldBox;
								}
								return newBox;
							}}
						/>
						<Rect
							fill='rgba(0,0,255,0.5)'
							x={0}
							y={0}
							width={100}
							opacity={0}
							height={100}
							ref={selectionRectRef}
						/>
					</Layer>
				</Stage>
				<input
					{...getInputProps()}
					type={'file'}
					className={'hidden'}
					accept={'image/*'}
				/>
			</div>
		</div>
	);
};
