export default {
  writerOpts: {
    transform: (commit: any, context: any) => {
      const typeMap: Record<string, "patch" | "minor" | "major"> = {
        feat: "minor",
        fix: "patch",
        perf: "patch",
        docs: "patch",
        refactor: "patch",
        chore: "patch",
        test: "patch",
        BREAKING: "major"
      };

      commit.versionLevel = typeMap[commit.type] ?? "patch";
      return commit;
    },
    groupBy: "type",
    commitGroupsSort: "title",
    commitsSort: ["scope", "subject"],
    generateOn: "version"
  }
};
