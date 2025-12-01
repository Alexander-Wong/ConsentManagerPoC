module.exports = {
    writerOpts: {
        transform: (commit, context) => {
            // Map commit types to version level
            const typeMap = {
                feat: "minor",
                fix: "patch",
                perf: "patch",
                docs: "patch",
                refactor: "patch",
                chore: "patch",
                test: "patch",
                BREAKING: "major"
            };

            // Determine level
            commit.versionLevel = typeMap[commit.type] || "patch";

            return commit;
        },
        groupBy: "type",
        commitGroupsSort: "title",
        commitsSort: ["scope", "subject"],
        generateOn: "version"
    }
};
