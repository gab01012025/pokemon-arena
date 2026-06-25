#!/bin/bash
# Download anime-style Pokemon images from pokemon.com
# These are the official Ken Sugimori artwork used as basis for the anime

DIR="$(cd "$(dirname "$0")/.." && pwd)/public/pokemon-anime"
mkdir -p "$DIR"

# All Pokemon IDs used in the game (from pokemonNameToId mapping)
declare -A POKEMON=(
  # Gen 1 Starters & evolutions
  [bulbasaur]=1 [ivysaur]=2 [venusaur]=3
  [charmander]=4 [charmeleon]=5 [charizard]=6
  [squirtle]=7 [wartortle]=8 [blastoise]=9

  # Gen 1 Bug lines
  [caterpie]=10 [metapod]=11 [butterfree]=12
  [weedle]=13 [kakuna]=14 [beedrill]=15

  # Gen 1 Birds
  [pidgey]=16 [pidgeotto]=17 [pidgeot]=18
  [spearow]=21 [fearow]=22

  # Gen 1 Rodents
  [rattata]=19 [raticate]=20

  # Gen 1 Poison
  [ekans]=23 [arbok]=24
  [nidoranf]=29 [nidorina]=30 [nidoqueen]=31
  [nidoranm]=32 [nidorino]=33 [nidoking]=34
  [zubat]=41 [grimer]=88 [koffing]=109 [weezing]=110

  # Gen 1 Electric
  [pikachu]=25 [raichu]=26
  [magnemite]=81 [magneton]=82
  [voltorb]=100 [electrode]=101 [electabuzz]=125

  # Gen 1 Ground/Rock
  [sandshrew]=27 [sandslash]=28
  [diglett]=50 [geodude]=74 [graveler]=75
  [onix]=95 [cubone]=104 [marowak]=105 [rhyhorn]=111

  # Gen 1 Fairy/Normal
  [clefairy]=35 [clefable]=36
  [jigglypuff]=39 [wigglytuff]=40
  [meowth]=52 [persian]=53 [chansey]=113 [snorlax]=143

  # Gen 1 Fire
  [vulpix]=37 [ninetales]=38
  [growlithe]=58 [arcanine]=59
  [ponyta]=77 [rapidash]=78 [magmar]=126

  # Gen 1 Grass
  [oddish]=43 [gloom]=44 [vileplume]=45
  [bellsprout]=69 [tangela]=114
  [exeggcute]=102 [exeggutor]=103

  # Gen 1 Water
  [psyduck]=54 [golduck]=55
  [poliwag]=60 [poliwhirl]=61 [poliwrath]=62
  [tentacool]=72 [slowpoke]=79 [slowbro]=80
  [horsea]=116 [seadra]=117 [staryu]=120
  [magikarp]=129 [gyarados]=130 [lapras]=131

  # Gen 1 Fighting
  [mankey]=56 [machop]=66 [machoke]=67 [machamp]=68
  [hitmonlee]=106 [hitmonchan]=107

  # Gen 1 Psychic
  [abra]=63 [kadabra]=64 [alakazam]=65

  # Gen 1 Ghost
  [gastly]=92 [haunter]=93 [gengar]=94

  # Gen 1 Others
  [ditto]=132 [eevee]=133
  [vaporeon]=134 [jolteon]=135 [flareon]=136
  [dratini]=147 [dragonair]=148 [dragonite]=149
  [mewtwo]=150 [mew]=151

  # Gen 1 Steel
  [scizor]=212

  # Gen 2
  [chikorita]=152 [bayleef]=153 [meganium]=154
  [cyndaquil]=155 [quilava]=156 [typhlosion]=157
  [totodile]=158 [croconaw]=159 [feraligatr]=160
  [espeon]=196 [umbreon]=197
  [mareep]=179 [flaaffy]=180 [ampharos]=181
  [larvitar]=246 [pupitar]=247 [tyranitar]=248
  [raikou]=243 [entei]=244 [suicune]=245
  [lugia]=249 [ho-oh]=250 [celebi]=251
  [articuno]=144 [zapdos]=145 [moltres]=146

  # Gen 3
  [treecko]=252 [grovyle]=253 [sceptile]=254
  [torchic]=255 [combusken]=256 [blaziken]=257
  [mudkip]=258 [marshtomp]=259 [swampert]=260
  [ralts]=280 [kirlia]=281 [gardevoir]=282
  [absol]=359
  [bagon]=371 [shelgon]=372 [salamence]=373
  [beldum]=374 [metang]=375 [metagross]=376

  # Gen 4
  [shinx]=403 [luxio]=404 [luxray]=405
  [gible]=443 [gabite]=444 [garchomp]=445
  [riolu]=447 [lucario]=448
  [leafeon]=470 [glaceon]=471

  # Gen 5
  [zorua]=570 [zoroark]=571
  [axew]=610 [fraxure]=611 [haxorus]=612
  [deino]=633 [zweilous]=634 [hydreigon]=635
  [larvesta]=636 [volcarona]=637

  # Gen 6
  [froakie]=656 [frogadier]=657 [greninja]=658
  [honedge]=679 [doublade]=680 [aegislash]=681
  [sylveon]=700

  # Gen 7
  [rowlet]=722 [dartrix]=723 [decidueye]=724
  [mimikyu]=778

  # Gen 8
  [dreepy]=885 [drakloak]=886 [dragapult]=887
)

TOTAL=${#POKEMON[@]}
COUNT=0
SKIPPED=0
FAILED=0

echo "Downloading $TOTAL anime-style Pokemon images..."
echo ""

for name in $(echo "${!POKEMON[@]}" | tr ' ' '\n' | sort); do
  id=${POKEMON[$name]}
  padded=$(printf "%03d" "$id")
  file="$DIR/${id}.png"

  COUNT=$((COUNT + 1))

  if [ -f "$file" ]; then
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  url="https://assets.pokemon.com/assets/cms2/img/pokedex/full/${padded}.png"

  if curl -sf -o "$file" "$url"; then
    echo "[$COUNT/$TOTAL] Downloaded: $name (#$id)"
  else
    FAILED=$((FAILED + 1))
    echo "[$COUNT/$TOTAL] FAILED: $name (#$id) - $url"
  fi

  # Small delay to be nice to the server
  sleep 0.1
done

echo ""
echo "Done! Downloaded: $((COUNT - SKIPPED - FAILED)), Skipped: $SKIPPED, Failed: $FAILED"
echo "Images saved to: $DIR"
