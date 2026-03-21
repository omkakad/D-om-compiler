import { loader } from '@monaco-editor/react';
import { getAICompletion } from './aiCompletion';
import { LANGUAGES } from '../types';

export const configureMonaco = () => {
  loader.init().then((monaco) => {
    // Register AI Inline Completion Provider for all languages
    monaco.languages.registerInlineCompletionsProvider({ pattern: '**' }, {
      provideInlineCompletions: async (model, position) => {
        const textBefore = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });
        
        const textAfter = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: model.getLineCount(),
          endColumn: model.getLineMaxColumn(model.getLineCount()),
        });

        // Find current language
        const langId = model.getLanguageId();
        const language = LANGUAGES.find(l => l.monaco === langId) || LANGUAGES[0];

        // Only trigger if user has typed something or is in a comment
        const lastLine = textBefore.split('\n').pop() || '';
        if (lastLine.trim().length < 3 && !lastLine.includes('//') && !lastLine.includes('#')) {
          return { items: [] };
        }

        try {
          const completion = await getAICompletion(textBefore, textAfter, language);
          if (!completion || completion.startsWith("AI Assistant not configured")) return { items: [] };

          return {
            items: [
              {
                insertText: completion,
                range: {
                  startLineNumber: position.lineNumber,
                  startColumn: position.column,
                  endLineNumber: position.lineNumber,
                  endColumn: position.column,
                },
              },
            ],
          };
        } catch (error) {
          return { items: [] };
        }
      },
      freeInlineCompletions: () => {},
    });

    // Register Dart completion provider
    monaco.languages.registerCompletionItemProvider('dart', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          // Common Widgets
          {
            label: 'Container',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'Container(\n  padding: EdgeInsets.all(${1:8.0}),\n  child: ${2:Text("Hello")},\n)',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'A convenience widget that combines common painting, positioning, and sizing widgets.',
            range: range,
          },
          {
            label: 'Column',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'Column(\n  mainAxisAlignment: MainAxisAlignment.${1:center},\n  children: [\n    ${2:Text("Item 1")},\n  ],\n)',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'A widget that displays its children in a vertical array.',
            range: range,
          },
          {
            label: 'Row',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'Row(\n  mainAxisAlignment: MainAxisAlignment.${1:center},\n  children: [\n    ${2:Text("Item 1")},\n  ],\n)',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'A widget that displays its children in a horizontal array.',
            range: range,
          },
          {
            label: 'Text',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'Text("${1:Hello World}")',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'A run of text with a single style.',
            range: range,
          },
          {
            label: 'Scaffold',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'Scaffold(\n  appBar: AppBar(\n    title: Text("${1:Title}"),\n  ),\n  body: ${2:Center(child: Text("Hello"))},\n)',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Implements the basic Material Design visual layout structure.',
            range: range,
          },
          {
            label: 'Center',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'Center(\n  child: ${1:Text("Hello")},\n)',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'A widget that centers its child within itself.',
            range: range,
          },
          {
            label: 'ElevatedButton',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'ElevatedButton(\n  onPressed: () {\n    ${1:// action}\n  },\n  child: Text("${2:Button}"),\n)',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'A Material Design "elevated button".',
            range: range,
          },
          {
            label: 'Padding',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'Padding(\n  padding: EdgeInsets.all(${1:8.0}),\n  child: ${2:Text("Hello")},\n)',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'A widget that insets its child by the given padding.',
            range: range,
          },
          {
            label: 'Icon',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'Icon(Icons.${1:add})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'A graphical icon widget drawn with a glyph from a font described in an IconData.',
            range: range,
          },
          {
            label: 'FloatingActionButton',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'FloatingActionButton(\n  onPressed: () {\n    ${1:// action}\n  },\n  child: Icon(Icons.${2:add}),\n)',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'A Material Design floating action button.',
            range: range,
          },
          
          // Common Properties
          {
            label: 'child:',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'child: ',
            range: range,
          },
          {
            label: 'children:',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'children: [\n  $0\n],',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
          },
          {
            label: 'onPressed:',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'onPressed: () {\n  $0\n},',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
          },
          {
            label: 'padding:',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'padding: EdgeInsets.all(${1:8.0}),',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
          },
          {
            label: 'decoration:',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'decoration: BoxDecoration(\n  color: Colors.${1:blue},\n  borderRadius: BorderRadius.circular(${2:8.0}),\n),',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
          },
          {
            label: 'style:',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'style: TextStyle(\n  fontSize: ${1:16.0},\n  fontWeight: FontWeight.${2:bold},\n),',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
          },
          {
            label: 'mainAxisAlignment:',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'mainAxisAlignment: MainAxisAlignment.${1:center},',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
          },
          {
            label: 'crossAxisAlignment:',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'crossAxisAlignment: CrossAxisAlignment.${1:center},',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
          },
          
          // Common Enums/Values
          {
            label: 'Colors.blue',
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: 'Colors.blue',
            range: range,
          },
          {
            label: 'Colors.red',
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: 'Colors.red',
            range: range,
          },
          {
            label: 'Colors.green',
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: 'Colors.green',
            range: range,
          },
          {
            label: 'Colors.white',
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: 'Colors.white',
            range: range,
          },
          {
            label: 'MainAxisAlignment.center',
            kind: monaco.languages.CompletionItemKind.EnumMember,
            insertText: 'MainAxisAlignment.center',
            range: range,
          },
          {
            label: 'MainAxisAlignment.start',
            kind: monaco.languages.CompletionItemKind.EnumMember,
            insertText: 'MainAxisAlignment.start',
            range: range,
          },
          {
            label: 'MainAxisAlignment.end',
            kind: monaco.languages.CompletionItemKind.EnumMember,
            insertText: 'MainAxisAlignment.end',
            range: range,
          },
        ];

        return { suggestions: suggestions };
      },
    });
  });
};
