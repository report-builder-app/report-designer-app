import { FiType, FiDollarSign, FiCalendar, FiImage, FiBarChart2 } from 'react-icons/fi';

export const elementTypes = {
  textField: {
    label: 'Text Field',
    icon: FiType,
    create: () => ({
      type: 'textField',
      x: 0,
      y: 0,
      width: 100,
      height: 20,
      expression: '$F{field}',
      fontSize: 12,
      bold: false
    })
  },
  staticText: {
    label: 'Static Text',
    icon: FiType,
    create: () => ({
      type: 'staticText',
      x: 0,
      y: 0,
      width: 100,
      height: 20,
      text: 'Label',
      fontSize: 12,
      bold: false
    })
  },
  // Add more element types as needed
};

export const createElement = (type) => {
  return elementTypes[type].create();
};