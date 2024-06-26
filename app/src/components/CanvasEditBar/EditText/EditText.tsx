import { CanvasElementType } from '../../../services/canvas/canvas-element-types.enum'
import EditFontBold from './EditFontBold'
import EditFontColor from './EditFontColor'
import EditFontFamily from './EditFontFamily'
import EditFontItalic from './EditFontItalic'
import EditFontSizeInput from './EditFontSizeInput'
import EditFontUnderlined from './EditFontUnderlined'

interface Props {
    selectedElements: any
    handleUpdate: any
}

export const EditText = ({selectedElements, handleUpdate} : Props) => {
    return (
        <>
            <EditFontFamily
                fontFamily={
                    selectedElements.find((e) => e.type == CanvasElementType.TEXT)
                        ?.fontFamily || 'Arial'
                }
                onChange={handleUpdate}
            />
            <EditFontSizeInput
                fontSize={
                    selectedElements.find((e) => e.type == CanvasElementType.TEXT)
                        ?.fontSize || 30
                }
                onChange={handleUpdate}
            />
            <EditFontColor onChange={handleUpdate} />
            <EditFontBold
                currentValue={Boolean(
                    selectedElements.find((e) => e.type == CanvasElementType.TEXT)
                        ?.fontStyle
                )}
                onChange={handleUpdate}
            />
            <EditFontItalic
                currentValue={Boolean(
                    selectedElements.find((e) => e.type == CanvasElementType.TEXT)
                        ?.fontVariant
                )}
                onChange={handleUpdate}
            />
            <EditFontUnderlined
                currentValue={Boolean(
                    selectedElements.find((e) => e.type == CanvasElementType.TEXT)
                        ?.textDecoration
                )}
                onChange={handleUpdate}
            />
        </>
    )
}
