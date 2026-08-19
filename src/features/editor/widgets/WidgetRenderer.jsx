import { WIDGET_TYPES } from '../WidgetLibrary/widgetDefinitions.js';
import TextWidgetView from './TextWidgetView.jsx';
import KpiWidgetView from './KpiWidgetView.jsx';
import ChartWidgetView from './ChartWidgetView.jsx';
import TableWidgetView from './TableWidgetView.jsx';
import ImageWidgetView from './ImageWidgetView.jsx';
import ButtonWidgetView from './ButtonWidgetView.jsx';
import ShapeWidgetView from './ShapeWidgetView.jsx';
import GaugeWidgetView from './GaugeWidgetView.jsx';

export default function WidgetRenderer({ widget, interactive, onActivateButton }) {
  switch (widget.type) {
    case WIDGET_TYPES.TEXT:
      return <TextWidgetView props={widget.props} />;
    case WIDGET_TYPES.KPI:
      return <KpiWidgetView props={widget.props} />;
    case WIDGET_TYPES.CHART:
      return <ChartWidgetView props={widget.props} />;
    case WIDGET_TYPES.TABLE:
      return <TableWidgetView props={widget.props} />;
    case WIDGET_TYPES.IMAGE:
      return <ImageWidgetView props={widget.props} />;
    case WIDGET_TYPES.BUTTON:
      return <ButtonWidgetView props={widget.props} interactive={interactive} onActivate={() => onActivateButton?.(widget.id)} />;
    case WIDGET_TYPES.SHAPE:
      return <ShapeWidgetView props={widget.props} />;
    case WIDGET_TYPES.GAUGE:
      return <GaugeWidgetView props={widget.props} />;
    default:
      return null;
  }
}
