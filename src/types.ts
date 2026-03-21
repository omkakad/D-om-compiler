export type Language = {
  id: string;
  name: string;
  extension: string;
  monaco: string;
  defaultCode: string;
};

export const LANGUAGES: Language[] = [
  {
    id: 'python',
    name: 'Python',
    extension: 'py',
    monaco: 'python',
    defaultCode: 'print("Hello, World!")\n\n# Try some logic\nfor i in range(5):\n    print(f"Iteration {i}")',
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    extension: 'js',
    monaco: 'javascript',
    defaultCode: 'console.log("Hello, World!");\n\nconst numbers = [1, 2, 3, 4, 5];\nconst squared = numbers.map(n => n * n);\nconsole.log("Squared numbers:", squared);',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    extension: 'ts',
    monaco: 'typescript',
    defaultCode: 'interface User {\n  name: string;\n  id: number;\n}\n\nconst user: User = {\n  name: "OmniCode",\n  id: 1\n};\n\nconsole.log(`Hello, ${user.name}!`);',
  },
  {
    id: 'cpp',
    name: 'C++',
    extension: 'cpp',
    monaco: 'cpp',
    defaultCode: '#include <iostream>\n#include <vector>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    std::vector<int> v = {1, 2, 3};\n    for(int i : v) std::cout << i << " ";\n    return 0;\n}',
  },
  {
    id: 'java',
    name: 'Java',
    extension: 'java',
    monaco: 'java',
    defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n        for(int i = 0; i < 3; i++) {\n            System.out.println("Count: " + i);\n        }\n    }\n}',
  },
  {
    id: 'rust',
    name: 'Rust',
    extension: 'rs',
    monaco: 'rust',
    defaultCode: 'fn main() {\n    println!("Hello, World!");\n    let mut count = 0;\n    while count < 3 {\n        println!("Count: {}", count);\n        count += 1;\n    }\n}',
  },
  {
    id: 'go',
    name: 'Go',
    extension: 'go',
    monaco: 'go',
    defaultCode: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n    for i := 0; i < 3; i++ {\n        fmt.Printf("Index: %d\\n", i)\n    }\n}',
  },
  {
    id: 'ruby',
    name: 'Ruby',
    extension: 'rb',
    monaco: 'ruby',
    defaultCode: 'puts "Hello, World!"\n\n3.times do |i|\n  puts "Iteration #{i}"\nend',
  },
  {
    id: 'php',
    name: 'PHP',
    extension: 'php',
    monaco: 'php',
    defaultCode: '<?php\necho "Hello, World!\\n";\n$arr = [1, 2, 3];\nforeach($arr as $val) {\n    echo "Value: $val\\n";\n}',
  },
  {
    id: 'swift',
    name: 'Swift',
    extension: 'swift',
    monaco: 'swift',
    defaultCode: 'print("Hello, World!")\n\nlet names = ["Alice", "Bob"]\nfor name in names {\n    print("Hello, \\(name)!")\n}',
  },
  {
    id: 'dart',
    name: 'Dart',
    extension: 'dart',
    monaco: 'dart',
    defaultCode: 'void main() {\n  runApp(MyApp());\n}\n\nclass MyApp extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      home: Scaffold(\n        appBar: AppBar(\n          title: Text("Flutter Demo"),\n        ),\n        body: Center(\n          child: Column(\n            mainAxisAlignment: MainAxisAlignment.center,\n            children: [\n              Text("Hello Flutter!"),\n              ElevatedButton(\n                onPressed: () {},\n                child: Text("Click Me"),\n              ),\n            ],\n          ),\n        ),\n        floatingActionButton: FloatingActionButton(\n          onPressed: () {},\n          child: Icon(Icons.add),\n        ),\n      ),\n    );\n  }\n}',
  },
  {
    id: 'react',
    name: 'React (TSX)',
    extension: 'tsx',
    monaco: 'typescript',
    defaultCode: 'import React, { useState } from "react";\n\nconst Counter = () => {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <h1>Count: {count}</h1>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n    </div>\n  );\n};\n\nexport default Counter;',
  },
  {
    id: 'csharp',
    name: 'C#',
    extension: 'cs',
    monaco: 'csharp',
    defaultCode: 'using System;\n\npublic class Program {\n    public static void main() {\n        Console.WriteLine("Hello, World!");\n        for (int i = 0; i < 3; i++) {\n            Console.WriteLine($"Iteration {i}");\n        }\n    }\n}',
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    extension: 'kt',
    monaco: 'kotlin',
    defaultCode: 'fun main() {\n    println("Hello, World!")\n    val numbers = listOf(1, 2, 3)\n    for (n in numbers) {\n        println("Value: $n")\n    }\n}',
  },
  {
    id: 'sql',
    name: 'SQL',
    extension: 'sql',
    monaco: 'sql',
    defaultCode: '-- Create a sample table\nCREATE TABLE users (\n    id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL\n);\n\n-- Insert some data\nINSERT INTO users (id, name) VALUES (1, "Alice"), (2, "Bob");\n\n-- Query the data\nSELECT * FROM users WHERE id > 0;',
  },
  {
    id: 'html',
    name: 'HTML',
    extension: 'html',
    monaco: 'html',
    defaultCode: '<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f0f0; }\n    .card { background: white; padding: 2rem; border-radius: 8px; shadow: 0 4px 6px rgba(0,0,0,0.1); }\n    h1 { color: #333; }\n  </style>\n</head>\n<body>\n  <div class="card">\n    <h1>Hello from HTML!</h1>\n    <p>This is a live preview.</p>\n    <button onclick="alert(\'Clicked!\')">Click Me</button>\n  </div>\n</body>\n</html>',
  }
];

export type ExecutionResult = {
  output: string;
  error?: string;
  exitCode: number;
};
