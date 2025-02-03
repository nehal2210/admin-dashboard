"use client"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { DraggableSection } from "./draggable-section"

interface SortableContainerProps {
  items: any[]
  type: "word" | "matchPair" | "listenChoice"
  onReorder: (newItems: any[]) => void
  onFieldChange: (index: number, field: string, value: string | boolean) => void
}

export function SortableContainer({ items, type, onReorder, onFieldChange }: SortableContainerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // Add a small delay and distance constraint to prevent accidental drags
        delay: 100,
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)

      const newItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index + 1,
      }))
      onReorder(newItems)
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((item, index) => (
            <DraggableSection
              key={item.id}
              id={item.id}
              index={index}
              type={type}
              fields={item}
              onFieldChange={(field, value) => onFieldChange(index, field, value)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

