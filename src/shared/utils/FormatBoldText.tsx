import {Text} from 'react-native';

const formatBoldText = (input: string) => {
  const parts = input.split(/(\*\*[^*]+\*\*)/g); // tách theo nhóm **...**
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2); // bỏ ** ở đầu và cuối
      return (
        <Text key={index} style={{ fontWeight: 'bold' }}>
          {boldText}
        </Text>
      );
    } else {
      return <Text key={index}>{part}</Text>;
    }
  });
};

export default formatBoldText;