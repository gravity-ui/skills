import {Text} from '@gravity-ui/uikit';

export interface ListItemData {
  text: string;
  time: string;
}

export interface ListWidgetData {
  title: string;
  items: ListItemData[];
}

export function ListWidget({data}: {data: ListWidgetData}) {
  return (
    <div className="widget">
      <Text variant="subheader-1" ellipsis title={data.title}>
        {data.title}
      </Text>
      <div className="list">
        {(data.items ?? []).map((item, i) => (
          <div key={i} className="list__row">
            <div className="list__text">
              <Text variant="body-2">{item.text}</Text>
            </div>
            <div className="list__time">
              <Text variant="caption-1" color="hint">
                {item.time}
              </Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
