import { Group, Line } from "react-konva";

function WallSuggestionLayer({
  suggestions = [],
  currentTool,
  onRemoveSuggestion,
}) {
  if (!suggestions.length) return null;

  const canEditSuggestions = currentTool !== "pan";

  return (
    <Group>
      {suggestions.map((suggestion) => (
        <Line
          key={suggestion.id}
          points={[
            suggestion.startPoint.x,
            suggestion.startPoint.y,
            suggestion.endPoint.x,
            suggestion.endPoint.y,
          ]}
          stroke="#0ea5e9"
          strokeWidth={3}
          opacity={0.78}
          dash={[10, 6]}
          lineCap="square"
          listening={canEditSuggestions}
          hitStrokeWidth={18}
          onClick={(e) => {
            e.cancelBubble = true;
            onRemoveSuggestion?.(suggestion.id);
          }}
          onTap={(e) => {
            e.cancelBubble = true;
            onRemoveSuggestion?.(suggestion.id);
          }}
        />
      ))}
    </Group>
  );
}

export default WallSuggestionLayer;
