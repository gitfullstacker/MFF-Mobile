// MarkdownText.tsx
import React from 'react';
import { Text, View, StyleSheet, TextStyle, ViewStyle } from 'react-native';

interface MarkdownTextProps {
  children: string;
  style?: TextStyle;
}

interface MarkdownStyles {
  text?: TextStyle;
  bold?: TextStyle;
  italic?: TextStyle;
  listItem?: ViewStyle;
  listNumber?: TextStyle;
  listBullet?: TextStyle;
  listText?: TextStyle;
  heading1?: TextStyle;
  heading2?: TextStyle;
  heading3?: TextStyle;
  code?: TextStyle;
}

const MarkdownText: React.FC<MarkdownTextProps> = ({ children, style }) => {
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: any[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip empty lines
      if (!line.trim()) {
        elements.push(<View key={key++} style={{ height: 8 }} />);
        continue;
      }

      // Check for numbered list (e.g., "1. ", "2. ", etc.)
      const numberedListMatch = line.match(/^(\d+)\.\s+(.+)$/);
      if (numberedListMatch) {
        const number = numberedListMatch[1];
        const content = numberedListMatch[2];
        elements.push(
          <View key={key++} style={styles.listItem}>
            <Text style={styles.listNumber}>{number}. </Text>
            <Text style={[styles.listText, style]}>
              {parseInlineMarkdown(content)}
            </Text>
          </View>,
        );
        continue;
      }

      // Check for bullet list (e.g., "- ", "* ")
      const bulletListMatch = line.match(/^[-*]\s+(.+)$/);
      if (bulletListMatch) {
        const content = bulletListMatch[1];
        elements.push(
          <View key={key++} style={styles.listItem}>
            <Text style={styles.listBullet}>• </Text>
            <Text style={[styles.listText, style]}>
              {parseInlineMarkdown(content)}
            </Text>
          </View>,
        );
        continue;
      }

      // Check for headings
      const heading1Match = line.match(/^#\s+(.+)$/);
      if (heading1Match) {
        elements.push(
          <Text key={key++} style={[styles.heading1, style]}>
            {parseInlineMarkdown(heading1Match[1])}
          </Text>,
        );
        continue;
      }

      const heading2Match = line.match(/^##\s+(.+)$/);
      if (heading2Match) {
        elements.push(
          <Text key={key++} style={[styles.heading2, style]}>
            {parseInlineMarkdown(heading2Match[1])}
          </Text>,
        );
        continue;
      }

      const heading3Match = line.match(/^###\s+(.+)$/);
      if (heading3Match) {
        elements.push(
          <Text key={key++} style={[styles.heading3, style]}>
            {parseInlineMarkdown(heading3Match[1])}
          </Text>,
        );
        continue;
      }

      // Regular paragraph
      elements.push(
        <Text key={key++} style={[styles.text, style]}>
          {parseInlineMarkdown(line)}
        </Text>,
      );
    }

    return elements;
  };

  const parseInlineMarkdown = (text: string) => {
    const parts: (string | any)[] = [];
    let key = 0;
    let currentIndex = 0;

    // Combined regex for bold, italic, and inline code
    const inlineRegex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3|(`)(.*?)\5/g;
    let match;

    while ((match = inlineRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        parts.push(text.substring(currentIndex, match.index));
      }

      if (match[1]) {
        // Bold text (**text** or __text__)
        parts.push(
          <Text key={key++} style={styles.bold}>
            {match[2]}
          </Text>,
        );
      } else if (match[3]) {
        // Italic text (*text* or _text_)
        parts.push(
          <Text key={key++} style={styles.italic}>
            {match[4]}
          </Text>,
        );
      } else if (match[5]) {
        // Inline code (`code`)
        parts.push(
          <Text key={key++} style={styles.code}>
            {match[6]}
          </Text>,
        );
      }

      currentIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return <View style={styles.container}>{parseMarkdown(children)}</View>;
};

const styles = StyleSheet.create({
  container: {
    // Container for all markdown elements
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1a1a1a',
    marginVertical: 2,
  },
  bold: {
    fontWeight: '700',
    color: '#000',
  },
  italic: {
    fontStyle: 'italic',
  },
  code: {
    fontFamily: 'Courier',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 14,
  },
  listItem: {
    flexDirection: 'row',
    marginVertical: 3,
    paddingRight: 16,
  },
  listNumber: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: '#000',
    minWidth: 24,
  },
  listBullet: {
    fontSize: 15,
    lineHeight: 22,
    color: '#000',
    minWidth: 20,
  },
  listText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1a1a1a',
    flex: 1,
  },
  heading1: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 10,
    color: '#000',
  },
  heading2: {
    fontSize: 19,
    fontWeight: '600',
    marginVertical: 8,
    color: '#000',
  },
  heading3: {
    fontSize: 17,
    fontWeight: '600',
    marginVertical: 6,
    color: '#000',
  },
});

export default MarkdownText;
