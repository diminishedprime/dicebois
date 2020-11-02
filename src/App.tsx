import React from "react";
import {
  Button,
  TextField,
  IconButton,
  makeStyles,
  Typography,
} from "@material-ui/core";
import Add from "@material-ui/icons/Add";
import Remove from "@material-ui/icons/Remove";
import Edit from "@material-ui/icons/Edit";

const useStyles = makeStyles((a) => ({
  rollButton: {},
  diceGroup: {
    flexDirection: "column",
    margin: a.spacing(1),
  },
  dieText: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  totalResultContainer: {
    display: "flex",
    minWidth: a.spacing(12),
    flexDirection: "column",
    justifyContent: "center",
  },
  totalResult: {
    textAlign: "center",
  },
  diceResults: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
  },
  die: {
    display: "flex",
    margin: a.spacing(1),
    padding: a.spacing(1),
    minWidth: a.spacing(3.5),
  },
  addDie: {
    maxWidth: a.spacing(12),
  },
}));

const rollDie = (upTo: number) => {
  return Math.floor(Math.random() * upTo) + 1;
};

interface DieProps {
  type: number;
  lastRoll: number;
  removeSelf?: () => void;
}

const range = (n: number): number[] => {
  const array = [];
  for (let i = 0; i < n; i++) {
    array.push(i);
  }
  return array;
};

const Die: React.FC<DieProps> = ({ type, lastRoll, removeSelf }) => {
  const classes = useStyles();
  const rows = React.useMemo(() => Math.floor(Math.sqrt(type)) || 1, [type]);
  console.log({ type, rows });
  return (
    <div className={classes.die}>
      <div className={classes.dieText}>
        <Typography variant="body1">D{type}</Typography>
        <Typography variant="h4">{lastRoll}</Typography>
      </div>
      <span></span>
      {removeSelf && (
        <IconButton color="secondary" onClick={removeSelf}>
          <Remove />
        </IconButton>
      )}
    </div>
  );
};

interface DieType {
  type: number;
  lastRoll: number;
}

interface DiceGroupProps {
  name: string;
  setName: (newName: string) => void;
  dice: DieType[];
  addDie: (type: number) => void;
  setDice: (dice: DieType[]) => void;
  removeDie: (idx: number) => () => void;
}

const DiceGroup: React.FC<DiceGroupProps> = ({
  name,
  setName,
  dice,
  setDice,
  addDie,
  removeDie,
}) => {
  const classes = useStyles();
  const [localName, setLocalName] = React.useState(name);
  const [nextDie, setNextDie] = React.useState("6");

  const rollGroup = React.useCallback(() => {
    setDice(
      dice.map((die) => {
        const currentRoll = rollDie(die.type);
        return { ...die, lastRoll: currentRoll };
      })
    );
  }, [dice]);

  const [isNaming, setIsNaming] = React.useState(false);

  const addNewDie = React.useCallback(() => {
    const next = parseInt(nextDie);
    if (isNaN(next)) {
      return;
    }
    addDie(next);
  }, [nextDie]);

  return (
    <div className={classes.diceGroup}>
      <div>
        <TextField
          fullWidth
          value={localName}
          disabled={!isNaming}
          onBlur={() => {
            setIsNaming(false);
            setName(localName);
          }}
          onChange={(e) => setLocalName(e.target.value)}
          InputProps={{
            endAdornment: (
              <IconButton>
                <Edit onClick={() => setIsNaming((old) => !old)} />
              </IconButton>
            ),
          }}
        />
      </div>

      <div className={classes.diceResults}>
        <div className={classes.totalResultContainer}>
          <Typography variant="h3" className={classes.totalResult}>
            {dice.length > 0 &&
            dice.map((d) => d.lastRoll).every((a) => a !== undefined)
              ? dice.map((die) => die.lastRoll).reduce((a, b) => a! + b!, 0)
              : "n/a"}
          </Typography>
          {dice.length > 0 && (
            <Button
              className={classes.rollButton}
              color="primary"
              variant="outlined"
              onClick={rollGroup}
            >
              Roll
            </Button>
          )}
        </div>
        {dice.map((die, idx) => (
          <Die
            removeSelf={isNaming ? removeDie(idx) : undefined}
            key={`${die.type}-${idx}`}
            type={die.type}
            lastRoll={die.lastRoll}
          />
        ))}
      </div>
      {isNaming && (
        <TextField
          className={classes.addDie}
          label={`Sides`}
          value={nextDie}
          onKeyPress={(e) => {
            console.log({ e });
            if (e.charCode == 13) {
              addNewDie();
            }
          }}
          onChange={(e) => {
            setNextDie(e.target.value);
          }}
          InputProps={{
            endAdornment: (
              <IconButton onClick={addNewDie}>
                <Add />
              </IconButton>
            ),
          }}
        />
      )}
    </div>
  );
};

interface Group {
  name: string;
  dice: DieType[];
}

const groupKey = "groups";

function App() {
  const [groups, setGroups] = React.useState<Group[]>(() => {
    const groupsString = window.localStorage.getItem(groupKey);
    if (groupsString !== null) {
      const parsed = JSON.parse(groupsString);
      return parsed;
    }
    return [];
  });

  React.useEffect(() => {
    const groupsString = JSON.stringify(groups);
    window.localStorage.setItem(groupKey, groupsString);
  }, [groups]);

  const addGroup = React.useCallback(() => {
    setGroups((old) =>
      old.concat([{ name: "Unnamed. Click to name", dice: [] }])
    );
  }, []);

  const setName = React.useCallback(
    (groupIdx: number) => (newName: string) => {
      setGroups((old) =>
        old.map((group, gi) => {
          if (gi === groupIdx) {
            return { ...group, name: newName };
          } else {
            return group;
          }
        })
      );
    },
    []
  );

  const addDie = React.useCallback(
    (groupIdx: number) => (upTo: number) => {
      setGroups((old) =>
        old.map((group, gi) => {
          if (gi === groupIdx) {
            return {
              ...group,
              dice: group.dice.concat([{ type: upTo, lastRoll: 0 }]),
            };
          } else {
            return group;
          }
        })
      );
    },
    []
  );

  const setDice = React.useCallback(
    (groupIdx: number) => (dice: DieType[]) => {
      setGroups((old) =>
        old.map((group, gi) => {
          if (gi === groupIdx) {
            return {
              ...group,
              dice,
            };
          } else {
            return group;
          }
        })
      );
    },
    []
  );

  const removeDie = React.useCallback(
    (groupIdx: number) => (dieIdx: number) => () => {
      setGroups((old) =>
        old.map((group, gi) => {
          if (gi === groupIdx) {
            const oldDice = group.dice;
            const newDice = oldDice
              .slice(0, dieIdx)
              .concat(oldDice.slice(dieIdx + 1));
            console.log(newDice);
            return { ...group, dice: newDice };
          } else {
            return group;
          }
        })
      );
    },
    []
  );

  return (
    <div className="App">
      <p>No, you're a dice app</p>
      {groups.map(({ name, dice }, idx) => {
        return (
          <DiceGroup
            key={idx}
            name={name}
            dice={dice}
            setDice={setDice(idx)}
            setName={setName(idx)}
            addDie={addDie(idx)}
            removeDie={removeDie(idx)}
          />
        );
      })}
      <Button fullWidth color="primary" variant="contained" onClick={addGroup}>
        Add group
      </Button>
    </div>
  );
}

export default App;
