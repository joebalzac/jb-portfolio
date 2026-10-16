import type { MessageBlock } from './types';

/**
 * Extracted from the Apollo conversation surface so the interactive demos
 * reuse the real implementation instead of a lookalike copy.
 */

export function ApolloBlocks({ blocks }: { blocks: MessageBlock[] }) {
  return (
    <div className="flex max-w-full flex-col gap-2.5">
      {blocks.map((block, index) => {
        if (block.type === "text") {
          return (
            <div className="flex flex-col gap-2.5" key={index}>
              {block.text
                .split("\n")
                .filter(Boolean)
                .map((line, lineIndex) => (
                  <p
                    className="m-0 text-sm leading-product tracking-product text-product"
                    key={`${index}-${lineIndex}`}
                  >
                    {line}
                  </p>
                ))}
            </div>
          );
        }
        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag
              className={`m-0 flex list-outside flex-col gap-1.5 text-sm leading-product tracking-product text-product ${
                block.ordered ? "list-decimal pl-5" : "list-disc pl-list"
              }`}
              key={index}
            >
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ListTag>
          );
        }
        if (block.type === "table") {
          return (
            <div
              className="w-full overflow-x-auto rounded-lg border border-product-line"
              key={index}
            >
              <table className="w-full min-w-full border-collapse text-xs leading-product-table tracking-product">
                <thead>
                  <tr>
                    {block.columns.map((column) => (
                      <th
                        className="bg-product-soft px-2 py-1.75 text-left align-top font-medium whitespace-nowrap text-product-label first:whitespace-normal max-panel:whitespace-normal"
                        key={column}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td
                          className={`border-t border-product-line px-2 py-1.75 text-left align-top whitespace-nowrap text-product first:whitespace-normal max-panel:whitespace-normal ${
                            cell.startsWith("INVALID")
                              ? "font-medium text-product-alert"
                              : ""
                          }`}
                          key={`${rowIndex}-${cellIndex}`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (block.type === "draft") {
          return (
            <p
              className="m-0 rounded-r-lg border-l-2 border-product-accent bg-product-soft px-3.5 py-3 text-sm leading-product tracking-product whitespace-pre-wrap text-product"
              key={index}
            >
              {block.text}
            </p>
          );
        }
        return (
          <div className="flex flex-wrap gap-2" key={index}>
            {block.items.map((item) => (
              <span
                className="rounded-full border border-product-line bg-white px-3 py-1.5 text-product-chip leading-product-title tracking-product text-product"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}
